// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB tilkoblet: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Feil under tilkobling: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
