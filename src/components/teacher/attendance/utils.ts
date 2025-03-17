
import * as XLSX from 'xlsx';
import { AttendanceEvent, Attendee, StudentData } from '@/types';
import { toast } from "sonner";
import { processAbsentStudents, getStudentsByDepartmentAndYear } from '@/lib/mongodb';

/**
 * Marks students as absent for an event that has expired
 */
export const markAbsentStudents = async (event: AttendanceEvent, updateEvents?: (callback: (prev: AttendanceEvent[]) => AttendanceEvent[]) => void) => {
  try {
    if (event.absentProcessed) {
      return;
    }
    
    // Get all students from this department/year
    const departmentStudents = await getStudentsByDepartmentAndYear(
      event.department, 
      event.year
    );
    
    if (departmentStudents.length === 0) {
      // Fallback for demo - create some dummy students if none exist in DB
      const dummyStudents: StudentData[] = [];
      for (let i = 1; i <= 10; i++) {
        dummyStudents.push({
          id: `student-${i}`,
          name: `Student ${i}`,
          rollNo: `CS${event.year}${i.toString().padStart(2, '0')}`,
          sapId: `SAP${i.toString().padStart(3, '0')}`,
          present: false
        });
      }
      
      // Add absent students
      const absentStudents = dummyStudents
        .filter(student => !event.attendees.some(a => a.studentId === student.id))
        .map(student => ({
          studentId: student.id,
          name: student.name,
          rollNo: student.rollNo,
          sapId: student.sapId,
          scanTime: new Date(),
          present: false
        }));
      
      // Update localStorage for demo
      const storedEvents = localStorage.getItem('attendanceEvents') || '[]';
      const allEvents = JSON.parse(storedEvents);
      const eventIndex = allEvents.findIndex((e: AttendanceEvent) => e.id === event.id);
      
      if (eventIndex !== -1) {
        allEvents[eventIndex].attendees = [
          ...allEvents[eventIndex].attendees,
          ...absentStudents
        ];
        allEvents[eventIndex].absentProcessed = true;
        localStorage.setItem('attendanceEvents', JSON.stringify(allEvents));
        
        // Update current events state
        if (updateEvents) {
          updateEvents(prev => {
            const newEvents = [...prev];
            const idx = newEvents.findIndex(e => e.id === event.id);
            if (idx !== -1) {
              newEvents[idx].attendees = [
                ...newEvents[idx].attendees,
                ...absentStudents
              ];
              newEvents[idx].absentProcessed = true;
            }
            return newEvents;
          });
        }
      }
    } else {
      // Use MongoDB to process absent students
      const result = await processAbsentStudents(event.id, departmentStudents);
      if (result.success) {
        toast.success("Absent students marked successfully");
      }
    }
  } catch (error) {
    console.error("Error marking absent students:", error);
    toast.error("Failed to mark absent students");
  }
};

/**
 * Export event attendance data to Excel
 */
export const exportToExcel = (event: AttendanceEvent) => {
  try {
    // Sort attendees by roll number
    const sortedAttendees = [...event.attendees].sort((a, b) => 
      a.rollNo.localeCompare(b.rollNo)
    );
    
    // Prepare worksheet data
    const wsData = [
      ['Roll No', 'Name', 'SAP ID', 'Status', 'Time'],
      ...sortedAttendees.map(attendee => [
        attendee.rollNo,
        attendee.name,
        attendee.sapId,
        attendee.present ? 'Present' : 'Absent',
        attendee.present 
          ? new Date(attendee.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'N/A'
      ])
    ];
    
    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add title rows with event details
    XLSX.utils.sheet_add_aoa(ws, [
      [`Attendance: ${event.subject}`],
      [`Date: ${event.date} | Time: ${event.time} | Room: ${event.room}`],
      [`Department: ${event.department} | Year: ${event.year}`],
      [''] // Empty row before the headers
    ], { origin: 'A1' });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    
    // Generate Excel file and prompt download
    XLSX.writeFile(wb, `Attendance-${event.subject}-${event.date}.xlsx`);
    
    toast.success("Attendance data exported successfully");
  } catch (error) {
    console.error("Failed to export attendance:", error);
    toast.error("Failed to export attendance data");
  }
};
