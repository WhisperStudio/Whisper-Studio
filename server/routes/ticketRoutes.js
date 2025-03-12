// server/routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');

// GET /api/tickets - hent alle
router.get('/', getTickets);

// POST /api/tickets - opprett ny
router.post('/', createTicket);

// PUT /api/tickets/:id - oppdater ticket (svar, status, osv.)
router.put('/:id', updateTicket);

// DELETE /api/tickets/:id - slett ticket
router.delete('/:id', deleteTicket);

module.exports = router;
