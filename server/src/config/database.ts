import mongoose from 'mongoose';
import { environment } from './environment';

export const connectDB = async () => {
  try {
    await mongoose.connect(environment.mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 