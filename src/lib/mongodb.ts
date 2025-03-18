
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

// Connection cache
let clientPromise: Promise<MongoClient>;

// Connection function with caching to avoid reconnecting on every request
export const connectToDatabase = async () => {
  if (!clientPromise) {
    clientPromise = client.connect().catch(err => {
      console.error("Failed to connect to MongoDB:", err);
      toast.error("Database connection failed");
      throw err;
    });
  }
  return clientPromise;
};

// Export a function to get the database instance
export async function getDatabase() {
  try {
    const connectedClient = await connectToDatabase();
    return connectedClient.db("attendance-system");
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

// Define collection names as constants to avoid typos
export const COLLECTIONS = {
  USERS: "users",
  ATTENDANCE_EVENTS: "attendance_events",
  ATTENDEES: "attendees"
};

// Close the connection when the application shuts down
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});
