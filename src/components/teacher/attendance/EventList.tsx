
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
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useAuth } from '@/lib/auth';
import { AttendanceEvent } from '@/types';
import { Calendar } from 'lucide-react';
import { toast } from "sonner";
import { getTeacherEvents } from '@/lib/mongodb';
import { markAbsentStudents } from './utils';
import { EventCard } from './EventCard';
import { EventDetailsDialog } from './EventDetailsDialog';

export const EventList = () => {
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
              await markAbsentStudents(event, setEvents);
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
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onViewDetails={viewAttendees} 
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EventDetailsDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={closeDialog}
      />
    </>
  );
};
