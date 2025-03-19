
import { supabase } from "@/integrations/supabase/client";
import { AttendanceEvent, Attendee, QRData, StudentData } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Helper to handle Supabase API errors
const handleError = (error: any) => {
  console.error("Supabase error:", error);
  throw new Error(error.message || "An error occurred with the database");
};

export const getTeacherEvents = async (teacherId: string): Promise<AttendanceEvent[]> => {
  try {
    // Fetch events from localStorage for now (will be replaced with Supabase)
    const storedEvents = localStorage.getItem('attendanceEvents');
    if (!storedEvents) return [];
    
    const events = JSON.parse(storedEvents);
    return events.filter((event: AttendanceEvent) => event.teacherId === teacherId);
  } catch (error) {
    console.error("Failed to get teacher events:", error);
    return [];
  }
};

export const getStudentsByDepartmentAndYear = async (
  department: string,
  year: string
): Promise<StudentData[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, roll_no, sap_id')
      .eq('department', department)
      .eq('year', year)
      .eq('role', 'student');
      
    if (error) throw error;
    
    // Map to our application types
    return (data || []).map(student => ({
      id: student.id,
      name: student.name,
      rollNo: student.roll_no || '',
      sapId: student.sap_id || '',
      present: false
    }));
  } catch (error) {
    console.error("Failed to get students:", error);
    return [];
  }
};

export const storeAttendanceEvent = async (event: AttendanceEvent): Promise<{ success: boolean }> => {
  try {
    // For now, just store in localStorage
    const storedEvents = localStorage.getItem('attendanceEvents') || '[]';
    const events = JSON.parse(storedEvents);
    
    // Check if event already exists
    const eventExists = events.some((e: any) => e.id === event.id);
    
    if (!eventExists) {
      events.push(event);
      localStorage.setItem('attendanceEvents', JSON.stringify(events));
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to store attendance event:", error);
    return { success: false };
  }
};

export const processAbsentStudents = async (
  eventId: string,
  departmentStudents: StudentData[]
): Promise<{ success: boolean }> => {
  try {
    // Get the event from localStorage
    const storedEvents = localStorage.getItem('attendanceEvents') || '[]';
    const allEvents = JSON.parse(storedEvents);
    const eventIndex = allEvents.findIndex((e: AttendanceEvent) => e.id === eventId);
    
    if (eventIndex === -1) {
      return { success: false };
    }
    
    const event = allEvents[eventIndex];
    
    // Find students who are not in the attendees list
    const absentStudents = departmentStudents
      .filter(student => !event.attendees.some(a => a.studentId === student.id))
      .map(student => ({
        studentId: student.id,
        name: student.name,
        rollNo: student.rollNo,
        sapId: student.sapId,
        scanTime: new Date(),
        present: false
      }));
    
    // Update the event with absent students
    allEvents[eventIndex].attendees = [
      ...allEvents[eventIndex].attendees,
      ...absentStudents
    ];
    allEvents[eventIndex].absentProcessed = true;
    
    // Save back to localStorage
    localStorage.setItem('attendanceEvents', JSON.stringify(allEvents));
    
    return { success: true };
  } catch (error) {
    console.error("Failed to process absent students:", error);
    return { success: false };
  }
};

export const markStudentAttendance = async (
  eventId: string,
  student: {
    id: string;
    name: string;
    rollNo: string;
    sapId: string;
  }
): Promise<{ success: boolean }> => {
  try {
    // Get the events from localStorage
    const storedEvents = localStorage.getItem('attendanceEvents') || '[]';
    const allEvents = JSON.parse(storedEvents);
    const eventIndex = allEvents.findIndex((e: AttendanceEvent) => e.id === eventId);
    
    if (eventIndex === -1) {
      return { success: false };
    }
    
    // Check if student already marked attendance
    const attendeeIndex = allEvents[eventIndex].attendees.findIndex(
      (a: Attendee) => a.studentId === student.id
    );
    
    if (attendeeIndex !== -1) {
      // Student already marked attendance
      return { success: true };
    }
    
    // Add student to attendees
    const newAttendee: Attendee = {
      studentId: student.id,
      name: student.name,
      rollNo: student.rollNo,
      sapId: student.sapId,
      scanTime: new Date(),
      present: true
    };
    
    allEvents[eventIndex].attendees.push(newAttendee);
    
    // Save back to localStorage
    localStorage.setItem('attendanceEvents', JSON.stringify(allEvents));
    
    return { success: true };
  } catch (error) {
    console.error("Failed to mark student attendance:", error);
    return { success: false };
  }
};

export const validateQrCode = async (qrData: QRData, studentId: string): Promise<{
  valid: boolean;
  event?: AttendanceEvent;
  error?: string;
}> => {
  try {
    // Check if QR code is expired
    const now = new Date();
    const expiry = new Date(qrData.expiry);
    
    if (now > expiry) {
      return { valid: false, error: "QR code has expired" };
    }
    
    // Check if secret is valid
    if (qrData.secret !== "valid") {
      if (qrData.secret === "prank") {
        return { valid: false, error: "Nice try! This is a fake QR code. Ask your teacher for the real one." };
      }
      return { valid: false, error: "Invalid QR code" };
    }
    
    // Get event from localStorage
    const storedEvents = localStorage.getItem('attendanceEvents') || '[]';
    const allEvents = JSON.parse(storedEvents);
    const event = allEvents.find((e: AttendanceEvent) => e.id === qrData.eventId);
    
    if (!event) {
      return { valid: false, error: "Event not found" };
    }
    
    // Check if student is in the right department and year
    const { data: studentData, error } = await supabase
      .from('users')
      .select('department, year')
      .eq('id', studentId)
      .single();
      
    if (error || !studentData) {
      return { valid: false, error: "Student not found" };
    }
    
    // Check if departments and years match
    if (event.department !== studentData.department || event.year !== studentData.year) {
      return { 
        valid: false, 
        error: `This session is for ${event.department} Year ${event.year} students only` 
      };
    }
    
    return { valid: true, event };
    
  } catch (error) {
    console.error("Error validating QR code:", error);
    return { valid: false, error: "Failed to validate QR code" };
  }
};
