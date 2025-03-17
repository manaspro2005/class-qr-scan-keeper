
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { useAuth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const StudentLogin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If logged in as a teacher, redirect to teacher dashboard
  useEffect(() => {
    if (user && user.role === "teacher") {
      navigate("/teacher-dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 left-4"
      >
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </motion.div>
      
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Student Login</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access the attendance system
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl shadow-sm">
            <SignIn 
              routing="path" 
              path="/student-login" 
              signUpUrl="/student-register" 
              redirectUrl="/student-dashboard"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Are you a teacher? <Link to="/login" className="text-primary hover:underline">Login here</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentLogin;
