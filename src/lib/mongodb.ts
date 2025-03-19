
import { MongoClient, ServerApiVersion, ObjectId, WithId } from 'mongodb';
import { toast } from "sonner";
import { AttendanceEvent, Student, Attendee, StudentData } from '@/types';

const uri = "mongodb+srv://codedingwithmanas:bl2WGqX6ld1gyOPr@cluster0.q7ynb.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collection names
const DB_NAME = "attendance-system";
const COLLECTIONS = {
  EVENTS: "attendance-events",
  STUDENTS: "students",
  TEACHERS: "teachers"
};

// Export a function to get the database instance
export async function getDatabase() {
  try {
    await client.connect();
    return client.db(DB_NAME);
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

// Store attendance event
export async function storeAttendanceEvent(event: AttendanceEvent) {
  try {
    const collection = await getCollection<AttendanceEvent>(COLLECTIONS.EVENTS);
    const result = await collection.insertOne(event);
    console.log(`Attendance event saved with ID: ${result.insertedId}`);
    return { success: true, id: result.insertedId };
  } catch (error) {
    console.error("Failed to store attendance event:", error);
    toast.error("Failed to save attendance event");
    return { success: false, error };
  }
}

// Get attendance events for a teacher
export async function getTeacherEvents(teacherId: string) {
  try {
    const collection = await getCollection<AttendanceEvent>(COLLECTIONS.EVENTS);
    const events = await collection.find({ teacherId }).sort({ createdAt: -1 }).toArray();
    return events;
  } catch (error) {
    console.error("Failed to get teacher events:", error);
    toast.error("Failed to load attendance events");
    return [];
  }
}

// Mark student attendance
export async function markAttendance(eventId: string, student: Attendee) {
  try {
    const collection = await getCollection<AttendanceEvent>(COLLECTIONS.EVENTS);
    
    // Check if student already marked attendance
    const event = await collection.findOne({ id: eventId });
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if student already in attendees list
    if (event.attendees.some(a => a.studentId === student.studentId)) {
      return { success: false, message: "Already marked attendance" };
    }

    // Add student to attendees
    await collection.updateOne(
      { id: eventId },
      { $push: { attendees: student } }
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to mark attendance:", error);
    toast.error("Failed to mark attendance");
    return { success: false, error };
  }
}

// Mark absent students after QR expiry
export async function processAbsentStudents(eventId: string, departmentStudents: StudentData[]) {
  try {
    const collection = await getCollection<AttendanceEvent>(COLLECTIONS.EVENTS);
    
    // Get the event
    const event = await collection.findOne({ id: eventId });
    if (!event) {
      throw new Error("Event not found");
    }
    
    // If already processed, skip
    if (event.absentProcessed) {
      return { success: true, message: "Already processed" };
    }
    
    // Get all present student IDs
    const presentStudentIds = event.attendees.map(a => a.studentId);
    
    // Find absent students
    const absentStudents = departmentStudents
      .filter(student => !presentStudentIds.includes(student.id))
      .map(student => ({
        studentId: student.id,
        name: student.name,
        rollNo: student.rollNo,
        sapId: student.sapId,
        scanTime: new Date(),
        present: false
      }));
    
    // Add absent students to attendees
    await collection.updateOne(
      { id: eventId },
      { 
        $push: { attendees: { $each: absentStudents } },
        $set: { absentProcessed: true }
      }
    );
    
    return { success: true };
  } catch (error) {
    console.error("Failed to process absent students:", error);
    toast.error("Failed to mark absent students");
    return { success: false, error };
  }
}

// Store student data on registration
export async function storeStudent(student: Student) {
  try {
    const collection = await getCollection<Student>(COLLECTIONS.STUDENTS);
    
    // Check if student already exists with the same email
    const existingStudent = await collection.findOne({ email: student.email });
    if (existingStudent) {
      return { success: false, message: "Student with this email already exists" };
    }
    
    const result = await collection.insertOne(student);
    console.log(`Student saved with ID: ${result.insertedId}`);
    return { success: true, id: result.insertedId };
  } catch (error) {
    console.error("Failed to store student:", error);
    toast.error("Failed to save student data");
    return { success: false, error };
  }
}

// Get students by department and year
export async function getStudentsByDepartmentAndYear(department: string, year: string) {
  try {
    const collection = await getCollection<Student>(COLLECTIONS.STUDENTS);
    const students = await collection.find({ department, year }).toArray();
    
    // Map to StudentData format
    return students.map(student => ({
      id: student.id,
      name: student.name,
      rollNo: student.rollNo,
      sapId: student.sapId,
      present: false
    }));
  } catch (error) {
    console.error("Failed to get students:", error);
    toast.error("Failed to load students");
    return [];
  }
}

// Close the connection when the application shuts down
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});
