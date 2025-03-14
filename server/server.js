// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// 1) Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('MONGO_URI missing in .env');
  process.exit(1);
}
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// 2) Ticket model + routes
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

// CRUD for tickets
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
    if (!updated) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Could not update ticket', error });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Could not delete ticket', error });
  }
});

// 3) Conversation model (with userWantsAdmin)
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

// 4) Admin availability & typing (in-memory)
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

// NEW: admin typing endpoints
app.get('/api/admin/typing', (req, res) => {
  res.json({ adminTyping });
});

app.post('/api/admin/typing', (req, res) => {
  const { typing } = req.body;
  adminTyping = !!typing; // cast til boolean
  res.json({ adminTyping });
});

// 5) ChatGPT endpoint
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env');
  process.exit(1);
}

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

    // Find or create conversation
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

    // If user wants admin, skip ChatGPT
    if (conv.userWantsAdmin === true || userWantsAdmin === true) {
      if (!conv.userWantsAdmin && userWantsAdmin) {
        conv.userWantsAdmin = true;
      }
      // Add the user's message
      if (message) {
        conv.messages.push({ sender: 'user', text: message, timestamp: new Date() });
      }
      await conv.save();
      return res.json({ reply: '', conversationId: conv.conversationId });
    }

    // Otherwise, call ChatGPT
    let messagesForGPT = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Provide support to the user.'
      }
    ];
    for (let m of conv.messages) {
      messagesForGPT.push({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      });
    }
    if (message) {
      messagesForGPT.push({ role: 'user', content: message });
    }

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

    // Store the user's message + bot reply
    if (message) {
      conv.messages.push({ sender: 'user', text: message, timestamp: new Date() });
    }
    conv.messages.push({ sender: 'bot', text: reply, timestamp: new Date() });
    await conv.save();

    res.json({ reply, conversationId: conv.conversationId });
  } catch (error) {
    console.error('Error communicating with ChatGPT:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error communicating with ChatGPT' });
  }
});

// 6) Conversation routes
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

// Admin can reply
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

// Update conversation status
app.put('/api/conversations/:id', async (req, res) => {
  try {
    const conv = await Conversation.findOne({ conversationId: req.params.id });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    if (req.body.status) {
      conv.status = req.body.status;
    }
    await conv.save();
    res.json({ message: 'Conversation updated', conversation: conv });
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Delete conversation
app.delete('/api/conversations/:id', async (req, res) => {
  try {
    const conv = await Conversation.findOne({ conversationId: req.params.id });
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    await conv.deleteOne();
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// 7) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
