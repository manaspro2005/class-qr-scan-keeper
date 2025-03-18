
import { MongoClient, ServerApiVersion } from 'mongodb';
import { toast } from "sonner";

// Use environmental variable or direct URI (not recommended for production)
const uri = "mongodb+srv://codedingwithmanas:bl2WGqX6ld1gyOPr@cluster0.q7ynb.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with options
let client: MongoClient | null = null;

// Get or create a MongoDB client
const getClient = async () => {
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    try {
      await client.connect();
      console.log("MongoDB connection established");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      client = null;
      throw error;
    }
  }
  
  return client;
};

// Export a function to get the database instance
export async function getDatabase() {
  try {
    const client = await getClient();
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
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', async () => {
    if (client) {
      await client.close();
      client = null;
    }
  });
}
