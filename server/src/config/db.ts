import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  // Try the configured MongoDB URI first
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(`Connected to MongoDB at ${env.MONGODB_URI}`);
    return;
  } catch {
    console.log('Remote MongoDB not available, starting in-memory MongoDB...');
  }

  // Fall back to in-memory MongoDB
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(`Connected to in-memory MongoDB at ${uri}`);
}
