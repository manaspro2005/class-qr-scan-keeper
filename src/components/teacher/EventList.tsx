
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
import { AttendanceEvent, Attendee } from '@/types';
import { Eye, Calendar, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EventList = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AttendanceEvent | null>(null);

  useEffect(() => {
    const loadEvents = () => {
      try {
        // In a real app, this would fetch from your API
        // For demo, we'll load from local storage
        const storedEvents = localStorage.getItem('attendanceEvents');
        let parsedEvents: AttendanceEvent[] = [];
        
        if (storedEvents) {
          parsedEvents = JSON.parse(storedEvents);
        }
        
        // Filter events for current teacher
        if (user?.id) {
          parsedEvents = parsedEvents.filter(event => event.teacherId === user.id);
        }
        
        // Sort by date (newest first)
        parsedEvents.sort((a, b) => 
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
    // Also set up a refresh interval (e.g., every minute)
    const intervalId = setInterval(loadEvents, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const viewAttendees = (event: AttendanceEvent) => {
    setSelectedEvent(event);
  };

  const closeDialog = () => {
    setSelectedEvent(null);
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewAttendees(event)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
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

            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students Present ({selectedEvent?.attendees.length || 0})
              </h4>

              {selectedEvent?.attendees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No students marked present yet.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>SAP ID</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedEvent?.attendees.map((attendee: Attendee) => (
                        <TableRow key={attendee.studentId}>
                          <TableCell>{attendee.name}</TableCell>
                          <TableCell>{attendee.rollNo}</TableCell>
                          <TableCell>{attendee.sapId}</TableCell>
                          <TableCell>
                            {new Date(attendee.scanTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventList;
