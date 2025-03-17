
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useProtectedRoute } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventList } from "@/components/teacher/attendance/EventList";
import { motion } from "framer-motion";
import { LogOut, QrCode, Plus } from "lucide-react";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { loading } = useProtectedRoute("teacher");
  const [showWelcome, setShowWelcome] = useState(true);

  // Hide welcome card after 5 seconds
  setTimeout(() => {
    setShowWelcome(false);
  }, 5000);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
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
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Welcome, {user?.name}</CardTitle>
                <CardDescription>
                  You're logged in as a teacher. Create a new attendance session or view past records.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card hover-scale col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">Create New Session</CardTitle>
              <CardDescription>
                Generate a QR code for taking attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/create-session")} 
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Session
              </Button>
            </CardContent>
          </Card>
          
          <div className="col-span-1 md:col-span-2">
            <EventList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
