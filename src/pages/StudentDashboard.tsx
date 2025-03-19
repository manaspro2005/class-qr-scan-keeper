
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Scanner from "@/components/student/Scanner";
import { useAuth, useProtectedRoute } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceEvent } from "@/types";
import { toast } from "sonner";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { loading } = useProtectedRoute("student");
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [fetchingEvents, setFetchingEvents] = useState(true);

  // Fetch attendance events that match student's department and year
  useEffect(() => {
    const fetchAttendanceEvents = async () => {
      if (!user) return;
      
      try {
        setFetchingEvents(true);
        
        // Get current timestamp to filter out expired events
        const now = new Date().toISOString();
        
        // Query Supabase for active attendance events matching student's department and year
        const { data, error } = await supabase
          .from('attendance_events')
          .select('*')
          .eq('department', user.department)
          .eq('year', user.year)
          .gt('qr_expiry', now) // Only get non-expired events
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching attendance events:", error);
          toast.error("Failed to load attendance sessions");
          return;
        }
        
        console.log("Fetched attendance events:", data);
        
        if (data) {
          setEvents(data as unknown as AttendanceEvent[]);
        }
      } catch (err) {
        console.error("Error in fetchAttendanceEvents:", err);
        toast.error("Failed to load attendance data");
      } finally {
        setFetchingEvents(false);
      }
    };

    fetchAttendanceEvents();
    
    // Set up real-time subscription for new attendance events
    const subscription = supabase
      .channel('attendance_events_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'attendance_events' }, 
        payload => {
          // Check if the new event matches the student's department and year
          const newEvent = payload.new as any;
          if (newEvent.department === user?.department && newEvent.year === user?.year) {
            // Add the new event to the state
            setEvents(prev => [newEvent as unknown as AttendanceEvent, ...prev]);
            toast.info(`New session available: ${newEvent.subject}`);
          }
        })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container max-w-md mx-auto py-8">
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Student Dashboard</CardTitle>
            <CardDescription>
              Welcome, {user?.name}! Scan QR codes to mark your attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Department:</span>
                <p className="font-medium">{user?.department}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Year:</span>
                <p className="font-medium">{user?.year}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Roll No:</span>
                <p className="font-medium">{user?.rollNo}</p>
              </div>
              <div>
                <span className="text-muted-foreground">SAP ID:</span>
                <p className="font-medium">{user?.sapId}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => logout()} 
              className="w-full"
            >
              Logout
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Scan Attendance QR</CardTitle>
          </CardHeader>
          <CardContent>
            <Scanner />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Active Attendance Sessions</CardTitle>
            <CardDescription>
              Sessions available for your department and year
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetchingEvents ? (
              <div className="py-8 text-center text-muted-foreground">
                <div className="animate-pulse">Loading sessions...</div>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <h3 className="font-medium">{event.subject}</h3>
                      <div className="grid grid-cols-2 gap-1 mt-2 text-sm text-muted-foreground">
                        <div>Room: {event.room}</div>
                        <div>Teacher: {event.teacher_name}</div>
                        <div>Date: {event.date}</div>
                        <div>Time: {event.time}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No active attendance sessions available for your department and year.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
