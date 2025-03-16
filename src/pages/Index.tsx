
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Users, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30">
      <div className="container max-w-6xl px-4 py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-primary/5 rounded-full mb-4">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Attendance Management
            <span className="block text-primary">Made Simple</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            A seamless attendance tracking system for teachers and students, using secure QR codes.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button asChild size="lg" className="hover-scale">
              <Link to="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="hover-scale">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          <div className="glass-card p-6 rounded-xl hover-scale subtle-shadow space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Fast QR Scanning</h3>
            <p className="text-muted-foreground">
              Quick and reliable QR code scanning to mark attendance in seconds.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover-scale subtle-shadow space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Role-based Access</h3>
            <p className="text-muted-foreground">
              Secure system with separate interfaces for teachers and students.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover-scale subtle-shadow space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Time-limited Codes</h3>
            <p className="text-muted-foreground">
              QR codes that expire after 5 minutes for enhanced security.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
