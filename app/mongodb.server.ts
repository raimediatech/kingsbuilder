import { MongoClient } from 'mongodb';

declare global {
  var mongoClientGlobal: MongoClient;
}

// Connection URI
const uri = process.env.DATABASE_URL || '';

// Create a new MongoClient
let client: MongoClient;

if (process.env.NODE_ENV !== "production") {
  if (!global.mongoClientGlobal) {
    global.mongoClientGlobal = new MongoClient(uri);
  }
  client = global.mongoClientGlobal;
} else {
  client = new MongoClient(uri);
}

export default client;

export async function connectToDatabase() {
  try {
    await client.connect();
    return client.db();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}