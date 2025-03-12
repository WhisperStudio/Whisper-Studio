// server/models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['Games', 'General', 'Other', 'Work', 'Billing', 'Support', 'Sales'] // utvidet
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
    // Om du vil skille tickets i underkategorier, legg til mer felt her:
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

module.exports = mongoose.model('Ticket', ticketSchema);
