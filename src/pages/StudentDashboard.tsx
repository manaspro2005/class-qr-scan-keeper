
import { useEffect, useState } from "react";
import { useAuth, useProtectedRoute } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Scanner from "@/components/student/Scanner";
import { LogOut, QrCode, Scan, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Student, AttendanceEvent } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { loading } = useProtectedRoute("student");
  const [availableEvents, setAvailableEvents] = useState<AttendanceEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  useEffect(() => {
    const loadEvents = async () => {
      if (!user) return;
      
      try {
        // Get student data
        const student = user as Student;
        console.log("Current student user:", student);
        
        // Load events from Supabase
        const { data: sessions, error } = await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('department', student.department)
          .eq('year', student.year);
        
        if (error) {
          console.error("Error fetching attendance sessions:", error);
          return;
        }
        
        console.log("Fetched attendance sessions:", sessions);
        
        if (sessions?.length) {
          // Get attendance records to check if student has marked attendance
          const { data: attendanceRecords, error: recordsError } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('student_id', student.id);
            
          if (recordsError) {
            console.error("Error fetching attendance records:", recordsError);
          }
          
          console.log("Fetched attendance records:", attendanceRecords);
          
          // Transform sessions to match AttendanceEvent type
          const events: AttendanceEvent[] = sessions.map(session => {
            // Check if student has already marked attendance for this session
            const hasAttended = attendanceRecords?.some(record => 
              record.session_id === session.id
            );
            
            // Format for display
            const date = new Date(session.created_at).toLocaleDateString();
            const time = new Date(session.created_at).toLocaleTimeString();
            
            return {
              id: session.id,
              teacherId: session.teacher_id,
              date,
              time,
              room: session.room_number,
              subject: session.subject,
              department: session.department,
              year: session.year,
              qrCode: session.qr_code,
              qrExpiry: new Date(session.expires_at),
              createdAt: new Date(session.created_at),
              attendees: hasAttended ? [{ 
                studentId: student.id,
                name: student.name,
                rollNo: student.rollNo,
                sapId: student.sapId,
                scanTime: new Date(),
                present: true
              }] : []
            };
          });
          
          // Sort by date (newest first)
          events.sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );
          
          setAvailableEvents(events);
        } else {
          setAvailableEvents([]);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };
    
    loadEvents();
    
    // Refresh events periodically
    const intervalId = setInterval(() => loadEvents(), 30000);
    return () => clearInterval(intervalId);
  }, [user]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">You need to be logged in to access this page</div>
      </div>
    );
  }

  const student = user as Student;

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
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
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
                  <dd>{student?.name}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Roll Number</dt>
                  <dd>{student?.rollNo}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">SAP ID</dt>
                  <dd>{student?.sapId}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Department</dt>
                  <dd>{student?.department}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Year</dt>
                  <dd>{student?.year}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd>{student?.email}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </motion.div>
        
        {loadingEvents ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading available sessions...</p>
          </div>
        ) : availableEvents.length > 0 ? (
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
                  You have {availableEvents.length} active sessions for {student.department} Year {student.year}
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
                        {event.attendees.some(a => a.studentId === student.id) ? (
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  No Active Sessions
                </CardTitle>
                <CardDescription>
                  There are no active attendance sessions for {student.department} Year {student.year} at this time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Check back later or contact your teacher if you expected to see an attendance session.
                </p>
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
                  Scan the QR code displayed by your teacher to mark your attendance for {student.department} Year {student.year}
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
