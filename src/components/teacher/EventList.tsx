
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { AttendanceEvent, Attendee, StudentData } from '@/types';
import { Eye, Calendar, Clock, Users, Download, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { getTeacherEvents, processAbsentStudents, getStudentsByDepartmentAndYear } from '@/lib/mongodb';

const EventList = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AttendanceEvent | null>(null);
  const [processingAbsent, setProcessingAbsent] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        // Load from MongoDB
        if (user?.id) {
          const teacherEvents = await getTeacherEvents(user.id);
          setEvents(teacherEvents);
        } else {
          // Fallback to localStorage for development/demo
          const storedEvents = localStorage.getItem('attendanceEvents');
          let parsedEvents: AttendanceEvent[] = [];
          
          if (storedEvents) {
            parsedEvents = JSON.parse(storedEvents);
          }
          
          // Filter events for current teacher
          if (user?.id) {
            parsedEvents = parsedEvents.filter(event => event.teacherId === user.id);
          }
          
          // Process absent students for events where QR has expired and absent not yet processed
          for (const event of parsedEvents) {
            const now = new Date();
            const expiry = new Date(event.qrExpiry);
            
            if (now > expiry && !event.absentProcessed) {
              await markAbsentStudents(event);
            }
          }
          
          // Sort by date (newest first)
          parsedEvents.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
        toast.error('Failed to load attendance events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
    // Also set up a refresh interval (e.g., every minute)
    const intervalId = setInterval(loadEvents, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const markAbsentStudents = async (event: AttendanceEvent) => {
    try {
      if (event.absentProcessed) {
        return;
      }
      
      setProcessingAbsent(true);
      
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
          setEvents(prev => {
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
      } else {
        // Use MongoDB to process absent students
        const result = await processAbsentStudents(event.id, departmentStudents);
        if (result.success) {
          toast.success("Absent students marked successfully");
          
          // Refresh events list
          if (user?.id) {
            const refreshedEvents = await getTeacherEvents(user.id);
            setEvents(refreshedEvents);
          }
        }
      }
    } catch (error) {
      console.error("Error marking absent students:", error);
      toast.error("Failed to mark absent students");
    } finally {
      setProcessingAbsent(false);
    }
  };

  const viewAttendees = (event: AttendanceEvent) => {
    setSelectedEvent(event);
  };

  const closeDialog = () => {
    setSelectedEvent(null);
  };

  const exportToExcel = (event: AttendanceEvent) => {
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

  if (loading) {
    return (
      <Card className="w-full glass-card animate-pulse-soft">
        <CardHeader>
          <CardTitle>Loading Events...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="w-full glass-card animate-fade-in">
        <CardHeader>
          <CardTitle>No Events Found</CardTitle>
          <CardDescription>
            You haven't created any attendance events yet. Generate a QR code to start tracking attendance.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full glass-card animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Events
          </CardTitle>
          <CardDescription>
            View and manage your attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your recent attendance events.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="hidden md:table-cell">Subject</TableHead>
                <TableHead className="hidden md:table-cell">Room</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="hover-scale">
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell className="hidden md:table-cell">{event.subject}</TableCell>
                  <TableCell className="hidden md:table-cell">{event.room}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      <Users className="mr-1 h-3 w-3" />
                      {event.attendees.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewAttendees(event)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToExcel(event)}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Attendees Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={closeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="space-y-1">
              <div className="flex justify-between items-center">
                <span>Attendance Record</span>
                <Badge variant="outline" className="ml-2">
                  {selectedEvent?.department} - Year {selectedEvent?.year}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm font-normal text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {selectedEvent?.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedEvent?.time}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedEvent?.subject}
              </h3>
              <Badge>Room {selectedEvent?.room}</Badge>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendance ({selectedEvent?.attendees.length || 0})
              </h4>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => selectedEvent && exportToExcel(selectedEvent)}
              >
                <Download className="mr-1 h-4 w-4" />
                Export to Excel
              </Button>
            </div>

            {selectedEvent?.attendees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students marked present yet.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>SAP ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEvent?.attendees
                      .sort((a, b) => a.rollNo.localeCompare(b.rollNo))
                      .map((attendee: Attendee) => (
                        <TableRow key={attendee.studentId}>
                          <TableCell>{attendee.rollNo}</TableCell>
                          <TableCell>{attendee.name}</TableCell>
                          <TableCell>{attendee.sapId}</TableCell>
                          <TableCell>
                            {attendee.present ? (
                              <Badge variant="default" className="bg-green-500">
                                <Check className="mr-1 h-3 w-3" />
                                Present
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <X className="mr-1 h-3 w-3" />
                                Absent
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {attendee.present ? 
                              new Date(attendee.scanTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventList;
