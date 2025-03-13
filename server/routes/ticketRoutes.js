import express from 'express';
import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket
} from '../controllers/ticketController.js';

const router = express.Router();

// GET /api/tickets - hent alle
router.get('/', getTickets);

// POST /api/tickets - opprett ny
router.post('/', createTicket);

// PUT /api/tickets/:id - oppdater ticket (svar, status, osv.)
router.put('/:id', updateTicket);

// DELETE /api/tickets/:id - slett ticket
router.delete('/:id', deleteTicket);

export default router;
