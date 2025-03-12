// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Noen standard-opsjoner kan settes her om ønskelig
    });
    console.log(`MongoDB tilkoblet: ${conn.connection.host}`);
  } catch (error) {
    console.error('Kunne ikke koble til MongoDB', error);
    process.exit(1); // Avslutt om tilkobling feiler
  }
};

module.exports = connectDB;
