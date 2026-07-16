/* STREAMING_CHUNK: Initializing MongoDB database connection using Mongoose */
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rajyog_wedding_db');
    console.log(`Database Secured: Connected to MongoDB at ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};