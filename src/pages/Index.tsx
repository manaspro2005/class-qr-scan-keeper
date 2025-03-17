
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, UserCheck, BookOpen, School } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect already logged in users to their dashboard
  const handleLoginClick = () => {
    if (user) {
      if (user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } else {
      // Show options for login
      navigate("/login");
    }
  };

  // Container animation for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="inline-block bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent pb-2">
              QR Attendance System
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            A simple and efficient QR-based attendance system for educational institutions.
            Mark attendance with a quick scan, track records, and generate reports.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            size="lg" 
            onClick={() => navigate("/student-login")} 
            className="gap-2"
          >
            <UserCheck className="h-5 w-5" />
            Student Login
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate("/login")}
            className="gap-2"
          >
            <School className="h-5 w-5" />
            Teacher Login
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Features</h2>
            <p className="text-muted-foreground mt-4">
              Simplify attendance management with our powerful features
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={item}>
              <Card className="glass-card hover-scale h-full">
                <CardHeader className="pb-2">
                  <QrCode className="h-12 w-12 text-primary mb-2" />
                  <CardTitle>QR-Based Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/70">
                    Generate unique QR codes for each class session. Students scan to mark attendance instantly.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="glass-card hover-scale h-full">
                <CardHeader className="pb-2">
                  <UserCheck className="h-12 w-12 text-primary mb-2" />
                  <CardTitle>Real-time Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/70">
                    Monitor attendance in real-time. See who's present and who's absent at a glance.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="glass-card hover-scale h-full">
                <CardHeader className="pb-2">
                  <BookOpen className="h-12 w-12 text-primary mb-2" />
                  <CardTitle>Reports & Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/70">
                    Generate and export detailed attendance reports. Track attendance patterns over time.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
