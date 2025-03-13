// server/models/Conversation.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot', 'admin'], default: 'user' },
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  // Hvilken bruker (her kan du bruke email, eller generere en random sessionId)
  email: String,
  name: String,

  // For eksempel en conversationId du sender fra frontend (lagres i localStorage)
  conversationId: { type: String, unique: true },

  // Valgfritt: kategori, subCategory, etc.
  category: String,
  subCategory: String,

  // Selve meldingshistorikken
  messages: [messageSchema],

  // Status (open, closed, etc.)
  status: {
    type: String,
    enum: ['open', 'pending', 'closed'],
    default: 'open'
  }
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
