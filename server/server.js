require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const axios = require('axios');

const app = express();

// Konfigurasjon fra .env
const MONGO_URI = process.env.MONGO_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
const PORT = process.env.PORT || 5000;
const ADMIN_DOMAIN = process.env.ADMIN_DOMAIN; // skal være api.vintrastudio.com

if (!MONGO_URI || !OPENAI_API_KEY || !JWT_SECRET || !ADMIN_SECRET || !SALT_ROUNDS) {
  console.error('En eller flere miljøvariabler mangler. Sjekk .env-filen.');
  process.exit(1);
}

// Middleware
app.use(helmet());
app.use(xss());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Rate Limiting for /api endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Database Connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

/* ============================
   MODELS
============================ */

// 1. User Model (brukere & admin)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});
const User = mongoose.model('User', userSchema);

// 2. Ticket Model
const ticketSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['Games', 'General', 'Work', 'Billing', 'Support', 'Sales', 'Other']
    },
    email: { type: String, required: true },
    name: { type: String, required: true },
    message: { type: String, required: true },
    subCategory: { type: String, default: '' },
    reply: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'pending', 'closed'],
      default: 'open'
    }
  },
  { timestamps: true }
);
const Ticket = mongoose.model('Ticket', ticketSchema);

// 3. Conversation & Message Model
const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot', 'admin'], default: 'user' },
  text: String,
  timestamp: { type: Date, default: Date.now }
});
const conversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, unique: true },
    email: String,
    name: String,
    category: String,
    subCategory: String,
    userWantsAdmin: { type: Boolean, default: false },
    messages: [messageSchema],
    status: {
      type: String,
      enum: ['open', 'pending', 'closed'],
      default: 'open'
    }
  },
  { timestamps: true }
);
const Conversation = mongoose.model('Conversation', conversationSchema);

/* ============================
   AUTENTISERINGSMIDDELSERE
============================ */

// JWT token generator
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Middleware for verifisering av brukere
const auth = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware for admin-rettigheter
const adminAuth = async (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

/* ============================
   ROUTES - Bruker og Admin
============================ */

// Registrering for vanlige brukere
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, password: hashedPassword, role: 'user' });
    const token = generateToken(user);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Pålogging for vanlige brukere
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'user' }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    user.loginCount += 1;
    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    });
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      loginCount: user.loginCount,
      lastLogin: user.lastLogin
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Registrering for admin
app.post('/api/admin/register', async (req, res) => {
  try {
    const { username, email, password, adminSecret } = req.body;
    if (!username || !email || !password || !adminSecret)
      return res.status(400).json({ message: 'All fields are required' });
    if (adminSecret !== ADMIN_SECRET)
      return res.status(403).json({ message: 'Invalid admin secret' });

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, password: hashedPassword, role: 'admin' });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Pålogging for admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid admin credentials' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Admin account is deactivated' });

    user.loginCount += 1;
    user.lastLogin = Date.now();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, isAdmin: true, loginCount: user.loginCount },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.cookie('admin_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
      domain: ADMIN_DOMAIN,
      path: '/admin'
    });
    res.status(200).json({
      status: 'success',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error during admin login' });
  }
});

// Admin dashboard
app.get('/api/admin/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const recentLogins = await User.find()
      .sort({ lastLogin: -1 })
      .limit(5)
      .select('username email lastLogin loginCount');
    res.status(200).json({
      status: 'success',
      data: {
        analytics: { totalUsers, activeUsers, totalAdmins },
        recentActivity: recentLogins
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch admin dashboard data' });
  }
});

// Endepunkt for å oppdatere brukerstatus (aktiv/deaktivert)
app.patch('/api/admin/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean')
      return res.status(400).json({ message: 'Invalid status value' });

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    console.error('User status update error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update user status' });
  }
});

// Admin aktivitet (logg)
app.get('/api/admin/activity', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const activityLogs = await User.find()
      .sort({ lastLogin: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('username email role lastLogin loginCount isActive');
    const totalLogs = await User.countDocuments();
    res.status(200).json({
      status: 'success',
      data: {
        logs: activityLogs,
        pagination: {
          total: totalLogs,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalLogs / limit)
        }
      }
    });
  } catch (err) {
    console.error('Activity log error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch activity logs' });
  }
});

// Admin passordendring
app.post('/api/admin/reset-password', auth, adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await User.findById(req.user.id).select('+password');
    if (!(await bcrypt.compare(currentPassword, admin.password)))
      return res.status(401).json({ message: 'Current password is incorrect' });
    admin.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await admin.save();
    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to reset password' });
  }
});

/* ============================
   ROUTES - Ticket og Chat/Conversation
============================ */

// Ticket CRUD
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch tickets', error });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const { category, email, name, message, subCategory } = req.body;
    const newTicket = await Ticket.create({ category, email, name, message, subCategory });
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: 'Could not create ticket', error });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Ticket not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Could not update ticket', error });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Could not delete ticket', error });
  }
});

// In-memory admin tilgjengelighet & "typing"-status
let adminAvailable = false;
let adminTyping = false;

app.get('/api/admin/availability', (req, res) => {
  res.json({ adminAvailable });
});

app.post('/api/admin/availability', (req, res) => {
  const { available } = req.body;
  adminAvailable = available;
  res.json({ adminAvailable });
});

app.get('/api/admin/typing', (req, res) => {
  res.json({ adminTyping });
});

app.post('/api/admin/typing', (req, res) => {
  const { typing } = req.body;
  adminTyping = !!typing;
  res.json({ adminTyping });
});

// ChatGPT endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      conversationId,
      message,
      email,
      name,
      category,
      subCategory,
      userWantsAdmin
    } = req.body;
    let conv = null;
    if (conversationId) {
      conv = await Conversation.findOne({ conversationId });
    }
    if (!conv) {
      const newId = conversationId || `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      conv = await Conversation.create({
        conversationId: newId,
        email: email || '',
        name: name || '',
        category: category || '',
        subCategory: subCategory || '',
        userWantsAdmin: userWantsAdmin === true,
        messages: []
      });
    }
    // Dersom brukeren ønsker en admin, hopp over ChatGPT-kallet
    if (conv.userWantsAdmin === true || userWantsAdmin === true) {
      if (!conv.userWantsAdmin && userWantsAdmin) conv.userWantsAdmin = true;
      if (message) {
        conv.messages.push({ sender: 'user', text: message, timestamp: new Date() });
      }
      await conv.save();
      return res.json({ reply: '', conversationId: conv.conversationId });
    }
    // Forbered meldinger for ChatGPT
    let messagesForGPT = [
      { role: 'system', content: 'You are a helpful assistant. Provide support to the user.' }
    ];
    for (let m of conv.messages) {
      messagesForGPT.push({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      });
    }
    if (message) messagesForGPT.push({ role: 'user', content: message });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model: 'gpt-3.5-turbo', messages: messagesForGPT },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    const reply = response.data.choices[0].message.content;
    if (message) conv.messages.push({ sender: 'user', text: message, timestamp: new Date() });
    conv.messages.push({ sender: 'bot', text: reply, timestamp: new Date() });
    await conv.save();
    res.json({ reply, conversationId: conv.conversationId });
  } catch (error) {
    console.error('Error communicating with ChatGPT:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error communicating with ChatGPT' });
  }
});

// Conversation-ruter
app.get('/api/conversations', async (req, res) => {
  try {
    const allConvs = await Conversation.find().sort({ createdAt: -1 });
    res.json(allConvs);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch conversations' });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conv = await Conversation.findOne({ conversationId: req.params.id });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conv);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch conversation' });
  }
});

// Admin svarer på samtale
app.post('/api/conversations/:id/reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    const conv = await Conversation.findOne({ conversationId: req.params.id });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    conv.messages.push({ sender: 'admin', text: replyText, timestamp: new Date() });
    await conv.save();
    res.json({ message: 'Admin reply added successfully' });
  } catch (error) {
    console.error('Error adding admin reply:', error);
    res.status(500).json({ error: 'Failed to add admin reply' });
  }
});

// Oppdater samtalestatus
app.put('/api/conversations/:id', async (req, res) => {
  try {
    const conv = await Conversation.findOne({ conversationId: req.params.id });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (req.body.status) conv.status = req.body.status;
    await conv.save();
    res.json({ message: 'Conversation updated', conversation: conv });
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Slett samtale
app.delete('/api/conversations/:id', async (req, res) => {
  try {
    const conv = await Conversation.findOne({ conversationId: req.params.id });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    await conv.deleteOne();
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

/* ============================
   FEILHÅNDTERING
============================ */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

/* ============================
   START SERVER
============================ */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin portal available at https://${ADMIN_DOMAIN}/admin`);
});
