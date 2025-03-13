// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// 1) Koble til MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('MONGO_URI mangler i .env');
  process.exit(1);
}
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Tilkoblet MongoDB'))
  .catch((err) => {
    console.error('Feil ved tilkobling til MongoDB:', err);
    process.exit(1);
  });

// 2) Ticket-modell og ruter (CRUD)
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

// Tickets-ruter
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Kunne ikke hente tickets', error });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const { category, email, name, message, subCategory } = req.body;
    const newTicket = await Ticket.create({ category, email, name, message, subCategory });
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: 'Kunne ikke opprette ticket', error });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Ticket ikke funnet' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Kunne ikke oppdatere ticket', error });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Ticket ikke funnet' });
    }
    res.json({ message: 'Ticket slettet' });
  } catch (error) {
    res.status(400).json({ message: 'Kunne ikke slette ticket', error });
  }
});

// 3) Conversation-modell for live chat
const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot', 'admin'], default: 'user' },
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema(
  {
    // Unik streng for å identifisere en samtale
    conversationId: { type: String, unique: true },
    email: String,
    name: String,
    category: String,
    subCategory: String,
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

// 4) ChatGPT-endepunkt
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY mangler i .env');
  process.exit(1);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { conversationId, message, email, name, category, subCategory } = req.body;

    // Finn eller opprett en samtale
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
        messages: []
      });
    }

    // Bygg ChatGPT-historikk
    let messagesForGPT = [
      {
        role: 'system',
        content: 'Du er en hjelpsom assistent. Svar på meldinger og gi støtte til brukere.'
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

    // Kall ChatGPT
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messagesForGPT
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    const reply = response.data.choices[0].message.content;

    // Oppdater DB med brukermelding + botsvar
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

// 5) Ruter for å hente, lukke og slette samtaler
// Hent alle
app.get('/api/conversations', async (req, res) => {
  try {
    const allConvs = await Conversation.find().sort({ createdAt: -1 });
    res.json(allConvs);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch conversations' });
  }
});

// Hent én basert på conversationId
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conv = await Conversation.findOne({ conversationId: req.params.id });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conv);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch conversation' });
  }
});

// Admin kan svare via /reply (alltid sender: 'admin')
app.post('/api/conversations/:id/reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    const conv = await Conversation.findOne({ conversationId: req.params.id });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    conv.messages.push({
      sender: 'admin',
      text: replyText,
      timestamp: new Date()
    });
    await conv.save();
    res.json({ message: 'Admin reply added successfully' });
  } catch (error) {
    console.error('Error adding admin reply:', error);
    res.status(500).json({ error: 'Failed to add admin reply' });
  }
});

// Oppdater status (f.eks. lukke)
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

// Slett samtale
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

// 6) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server kjører på port ${PORT}`);
});
