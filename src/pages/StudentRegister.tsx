
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignUp } from "@clerk/clerk-react";
import { useAuth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const StudentRegister = () => {
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
            <h1 className="text-3xl font-bold">Student Registration</h1>
            <p className="text-muted-foreground mt-2">
              Create a new student account
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl shadow-sm">
            <SignUp 
              routing="path" 
              path="/student-register" 
              signInUrl="/student-login" 
              redirectUrl="/student-dashboard"
              unsafeMetadata={{
                role: "student",
                // These fields will be filled in by the custom registration form
                department: "",
                year: "",
                rollNo: "",
                sapId: ""
              }}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link to="/student-login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentRegister;
