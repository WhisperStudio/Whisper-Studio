// server/controllers/ticketController.js
import Ticket from '../models/Ticket.js';

// Hent alle tickets
export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Kunne ikke hente tickets', error });
  }
};

// Opprett ny ticket
export const createTicket = async (req, res) => {
  try {
    const { category, email, name, message, subCategory } = req.body;

    const newTicket = await Ticket.create({
      category,
      email,
      name,
      message,
      subCategory
    });

    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: 'Kunne ikke opprette ticket', error });
  }
};

// Oppdater ticket (for eksempel reply eller status)
export const updateTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const updated = await Ticket.findByIdAndUpdate(ticketId, req.body, {
      new: true
    });
    if (!updated) {
      return res.status(404).json({ message: 'Ticket ikke funnet' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Kunne ikke oppdatere ticket', error });
  }
};

// Slett ticket
export const deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const deleted = await Ticket.findByIdAndDelete(ticketId);
    if (!deleted) {
      return res.status(404).json({ message: 'Ticket ikke funnet' });
    }
    res.json({ message: 'Ticket slettet' });
  } catch (error) {
    res.status(400).json({ message: 'Kunne ikke slette ticket', error });
  }
};
