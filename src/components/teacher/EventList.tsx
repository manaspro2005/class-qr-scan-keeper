
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceEvent } from "@/types";
import { CalendarDays, Clock, Eye, Download, UserPlus, Users } from "lucide-react";
import AttendanceDetails from "./AttendanceDetails";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const EventList = () => {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AttendanceEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = () => {
      try {
        // Load events from localStorage
        const storedEvents = localStorage.getItem('attendanceEvents') || '[]';
        let parsedEvents = JSON.parse(storedEvents);
        
        // Sort by date (newest first)
        parsedEvents.sort((a: AttendanceEvent, b: AttendanceEvent) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
        toast.error('Failed to load attendance events');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
    
    // Refresh events every 30 seconds to catch new attendance
    const intervalId = setInterval(loadEvents, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Function to mark absent students after 5 minutes
  useEffect(() => {
    const markAbsentStudents = async () => {
      if (!events.length) return;
      
      // Current time
      const now = new Date();
      
      // Check each event
      const updatedEvents = events.map(event => {
        // Skip events that don't have QR expiry or events already processed
        if (!event.qrExpiry || event.absentProcessed) return event;
        
        // QR expiry time + 5 minutes
        const qrExpiry = new Date(event.qrExpiry);
        const cutoffTime = new Date(qrExpiry.getTime() + 5 * 60 * 1000);
        
        // If 5 minutes after QR expiry has passed, mark remaining students as absent
        if (now > cutoffTime && !event.absentProcessed) {
          // We would implement a function to get all students for this department/year
          // and mark those not in attendees as absent
          const updatedEvent = { ...event, absentProcessed: true };
          
          // For now, let's assume we have a mock list of all students in this department/year
          // In a real implementation, we would fetch this from the database
          const mockStudentList = [
            { id: "mock-1", name: "John Doe", rollNo: "CS001", sapId: "SAP001" },
            { id: "mock-2", name: "Jane Smith", rollNo: "CS002", sapId: "SAP002" },
            { id: "mock-3", name: "Bob Johnson", rollNo: "CS003", sapId: "SAP003" }
          ];
          
          // Get IDs of students who already marked attendance
          const presentStudentIds = new Set(updatedEvent.attendees.map(a => a.studentId));
          
          // Find students who didn't mark attendance
          const absentStudents = mockStudentList.filter(student => !presentStudentIds.has(student.id));
          
          // Add absent students to event attendees
          absentStudents.forEach(student => {
            updatedEvent.attendees.push({
              studentId: student.id,
              name: student.name,
              rollNo: student.rollNo,
              sapId: student.sapId,
              scanTime: new Date(),
              present: false
            });
          });
          
          return updatedEvent;
        }
        
        return event;
      });
      
      // Update state and localStorage
      if (JSON.stringify(updatedEvents) !== JSON.stringify(events)) {
        setEvents(updatedEvents);
        localStorage.setItem('attendanceEvents', JSON.stringify(updatedEvents));
      }
    };
    
    // Check for absent students every minute
    const intervalId = setInterval(markAbsentStudents, 60000);
    
    // Run once immediately
    markAbsentStudents();
    
    return () => clearInterval(intervalId);
  }, [events]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewAttendance = (event: AttendanceEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  const exportToExcel = (event: AttendanceEvent) => {
    try {
      // Sort attendees by roll number for easier reading
      const sortedAttendees = [...event.attendees].sort((a, b) => 
        a.rollNo.localeCompare(b.rollNo)
      );
      
      // Prepare data for export
      const exportData = sortedAttendees.map(student => ({
        'Roll No': student.rollNo,
        'SAP ID': student.sapId,
        'Name': student.name,
        'Status': student.present ? 'Present' : 'Absent',
        'Time': student.present ? new Date(student.scanTime).toLocaleTimeString() : '-'
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create column widths
      const colWidths = [
        { wch: 10 }, // Roll No
        { wch: 10 }, // SAP ID
        { wch: 25 }, // Name
        { wch: 10 }, // Status
        { wch: 10 }  // Time
      ];
      worksheet['!cols'] = colWidths;
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      
      // Generate file name
      const fileName = `Attendance_${event.subject}_${event.date}_${event.department}_Year${event.year}.xlsx`;
      
      // Export file
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Attendance data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export attendance data');
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Loading attendance records...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-secondary/50 rounded"></div>
            <div className="h-12 bg-secondary/50 rounded"></div>
            <div className="h-12 bg-secondary/50 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedEvent) {
    return (
      <AttendanceDetails 
        event={selectedEvent} 
        onClose={handleCloseDetails} 
        onExport={() => exportToExcel(selectedEvent)}
      />
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Attendance Records
        </CardTitle>
        <CardDescription>
          {events.length === 0 
            ? "No attendance sessions recorded yet" 
            : `${events.length} attendance session${events.length === 1 ? '' : 's'} recorded`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent">
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
            <TabsTrigger value="all">All Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent">
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{event.subject}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>{event.attendees.length} student{event.attendees.length === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Department:</span> {event.department}, Year {event.year}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col gap-2 sm:justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex gap-1.5"
                        onClick={() => handleViewAttendance(event)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex gap-1.5"
                        onClick={() => exportToExcel(event)}
                      >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {events.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No attendance sessions recorded yet
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all">
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{event.subject}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>{event.attendees.length} student{event.attendees.length === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Department:</span> {event.department}, Year {event.year}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col gap-2 sm:justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex gap-1.5"
                        onClick={() => handleViewAttendance(event)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex gap-1.5"
                        onClick={() => exportToExcel(event)}
                      >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {events.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No attendance sessions recorded yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EventList;
