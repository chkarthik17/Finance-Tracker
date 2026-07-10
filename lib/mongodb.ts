import { MongoClient, Db, Collection, ObjectId, Document } from "mongodb";
import { Entry, Holding, Plan } from "./types";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local");
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db("expense_tracker");
}

export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  const db = await getDatabase();
  return db.collection<T>(name);
}

// Helper to convert MongoDB _id to id for our types
export function convertId<T extends { _id?: any; id?: string }>(doc: T): Omit<T, '_id'> & { id: string } {
  if (!doc) return doc as any;
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() } as any;
}

// Helper to convert id back to _id for MongoDB
export function prepareForMongo<T extends { id?: string }>(doc: T): Omit<T, 'id'> & { _id?: ObjectId } {
  const { id, ...rest } = doc;
  if (id) {
    return { ...rest, _id: new ObjectId(id) } as any;
  }
  return rest as any;
}
