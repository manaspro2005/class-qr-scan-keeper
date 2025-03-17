
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

// Function to save student data from Clerk
export async function saveStudentData(studentData: any) {
  try {
    const studentsCollection = await getCollection('students');
    
    // Check if student already exists with this email
    const existingStudent = await studentsCollection.findOne({ email: studentData.email });
    
    if (existingStudent) {
      // Update existing student data
      await studentsCollection.updateOne(
        { email: studentData.email },
        { $set: studentData }
      );
      return existingStudent._id;
    } else {
      // Insert new student
      const result = await studentsCollection.insertOne(studentData);
      return result.insertedId;
    }
  } catch (error) {
    console.error("Failed to save student data:", error);
    toast.error("Failed to save student data to database");
    throw error;
  }
}

// Function to mark students as absent after time expires
export async function markAbsentStudents(eventId: string) {
  try {
    const eventsCollection = await getCollection('attendanceEvents');
    const event = await eventsCollection.findOne({ id: eventId });
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Get all students for this department and year
    const studentsCollection = await getCollection('students');
    const eligibleStudents = await studentsCollection.find({
      department: event.department,
      year: event.year
    }).toArray();
    
    // Get IDs of students who already marked attendance
    const presentStudentIds = new Set(event.attendees.map((a: any) => a.studentId));
    
    // Find students who didn't mark attendance
    const absentStudents = eligibleStudents.filter(student => !presentStudentIds.has(student.id));
    
    // Add absent students to event attendees
    for (const student of absentStudents) {
      event.attendees.push({
        studentId: student.id,
        name: student.name,
        rollNo: student.rollNo || "N/A",
        sapId: student.sapId || "N/A",
        scanTime: new Date(),
        present: false
      });
    }
    
    // Update event in database
    await eventsCollection.updateOne(
      { id: eventId },
      { $set: { attendees: event.attendees } }
    );
    
    return event.attendees;
  } catch (error) {
    console.error("Failed to mark absent students:", error);
    throw error;
  }
}

// Close the connection when the application shuts down
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});
