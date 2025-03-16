
import { useAuth, useProtectedRoute } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Scanner from "@/components/student/Scanner";
import { LogOut, QrCode, Scan } from "lucide-react";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { loading } = useProtectedRoute("student");
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  const student = user as any; // Type assertion for display purposes

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
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
                  Scan the QR code displayed by your teacher to mark your attendance
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
