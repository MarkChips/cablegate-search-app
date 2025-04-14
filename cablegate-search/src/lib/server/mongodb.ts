import { MongoClient } from "mongodb";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    // Reuse connection in dev to avoid hot-reload issues
    if (!global._mongoClientPromise) {
        client = new MongoClient(process.env.MONGO_URI!);
        global.mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // New connection in prod
    client = new MongoClient(process.env.MONGO_URI!);
    clientPromise = client.connect();
}

export async function getCollection() {
    const client = await clientPromise;
    return client.db('cablegate').collection('documents');
}