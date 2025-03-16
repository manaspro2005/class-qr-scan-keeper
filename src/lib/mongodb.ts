import { MongoClient, ServerApiVersion } from 'mongodb';
import { toast } from "sonner";

const uri = "mongodb+srv://codedingwithmanas:bl2WGqX6ld1gyOPr@cluster0.q7ynb.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Export a function to get the database instance
export async function getDatabase() {
  try {
    await client.connect();
    return client.db("attendance-system");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    toast.error("Failed to connect to database");
    throw error;
  }
}

// Function to get a collection with type safety
export async function getCollection<T>(collectionName: string) {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}

// Close the connection when the application shuts down
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});
