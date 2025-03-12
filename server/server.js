// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

// Koble til MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Ruter
app.use('/api/tickets', ticketRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server kjører på port ${PORT}`);
});
