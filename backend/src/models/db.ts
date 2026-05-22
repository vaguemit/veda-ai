import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let fallbackMode = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/veda-ai';
  try {
    mongoose.set('strictQuery', true);
    console.log(`Connecting to MongoDB at: ${uri}...`);
    
    // Set connection timeout to 3 seconds for quick fallback decision
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    
    isConnected = true;
    fallbackMode = false;
    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.warn('MongoDB connection failed. Switching to Local In-Memory / File-based Database Fallback.');
    isConnected = false;
    fallbackMode = true;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export function isFallbackMode() {
  return fallbackMode;
}
