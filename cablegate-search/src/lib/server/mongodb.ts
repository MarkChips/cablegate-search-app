import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV === 'development') {
  config({ path: path.resolve(process.cwd(), '../.env') });
}

const mongoUri = process.env.MONGO_URI;
console.log('MONGO_URI loaded:', mongoUri ? 'Set (length: ' + mongoUri.length + ')' : 'Not set');

if (!mongoUri) {
  throw new Error('MONGO_URI is not defined');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(mongoUri);
    global._mongoClientPromise = client.connect();
    console.log('MongoDB client initialized in development mode');
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(mongoUri);
  clientPromise = client.connect();
  console.log('MongoDB client initialized in production mode');
}

export async function getCollection() {
  try {
    const client = await clientPromise;
    const collection = client.db('cablegate').collection('documents');
    console.log('Connected to MongoDB: cablegate.documents');
    return collection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}