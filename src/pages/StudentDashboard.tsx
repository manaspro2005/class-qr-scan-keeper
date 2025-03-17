
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Scanner from "@/components/student/Scanner";
import { LogOut, QrCode, Scan, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AttendanceEvent } from "@/types";
import { useUser, useAuth, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// Define a type for student metadata
interface StudentMetadata {
  department?: string;
  year?: string;
  rollNo?: string;
  sapId?: string;
}

const StudentDashboard = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [availableEvents, setAvailableEvents] = useState<AttendanceEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  // Redirect to login if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      navigate("/student-login");
    }
  }, [isSignedIn, navigate]);
  
  useEffect(() => {
    const loadEvents = () => {
      if (!user) return;
      
      try {
        // Get student data from clerk metadata
        const studentMeta = user.publicMetadata as StudentMetadata;
        const department = studentMeta.department;
        const year = studentMeta.year;
        
        if (!department || !year) {
          console.warn("Student metadata incomplete:", studentMeta);
          return;
        }
        
        // Load events from localStorage
        const storedEvents = localStorage.getItem('attendanceEvents') || '[]';
        let events = JSON.parse(storedEvents);
        
        // Filter events for this student's department and year
        events = events.filter((event: AttendanceEvent) => 
          event.department === department && 
          event.year === year
        );
        
        // Sort by date (newest first)
        events.sort((a: AttendanceEvent, b: AttendanceEvent) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setAvailableEvents(events);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };
    
    loadEvents();
    
    // Refresh events periodically
    const intervalId = setInterval(loadEvents, 30000);
    return () => clearInterval(intervalId);
  }, [user]);
  
  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Redirecting to login...</div>
      </div>
    );
  }

  const studentMeta = user.publicMetadata as StudentMetadata;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Student Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user.fullName || user.username}
            </span>
            <SignOutButton>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </div>
      </header>
      
      <main className="container py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>
                Your personal details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Name</dt>
                  <dd>{user.fullName || user.username}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Roll Number</dt>
                  <dd>{studentMeta.rollNo || "Not set"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">SAP ID</dt>
                  <dd>{studentMeta.sapId || "Not set"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Department</dt>
                  <dd>{studentMeta.department || "Not set"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Year</dt>
                  <dd>{studentMeta.year || "Not set"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd>{user.primaryEmailAddress?.emailAddress || "Not set"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </motion.div>
        
        {availableEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Available Attendance Sessions
                </CardTitle>
                <CardDescription>
                  You have {availableEvents.length} active sessions for {studentMeta.department} Year {studentMeta.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {availableEvents.map((event) => (
                    <Card key={event.id} className="p-3 hover:bg-secondary/20 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{event.subject}</h3>
                          <p className="text-sm text-muted-foreground">Room {event.room} • {event.date} at {event.time}</p>
                        </div>
                        {event.attendees.some(a => a.studentId === user.id) ? (
                          <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            Marked
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            Pending
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="max-w-md w-full">
            <Card className="glass-card mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Attendance QR Scanner
                </CardTitle>
                <CardDescription>
                  Scan the QR code displayed by your teacher to mark your attendance for {studentMeta.department} Year {studentMeta.year}
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Scanner />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDashboard;
