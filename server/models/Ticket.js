// server/models/Ticket.js
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['Games', 'General', 'Other', 'Work', 'Billing', 'Support', 'Sales']
    },
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    reply: {
      type: String,
      default: ''
    },
    subCategory: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['open', 'pending', 'closed'],
      default: 'open'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Ticket', ticketSchema);
