
import { useNavigate } from "react-router-dom";
import TeacherForm from "@/components/teacher/TeacherForm";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const CreateSession = () => {
  const navigate = useNavigate();
  const { loading } = useProtectedRoute("teacher");

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
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/teacher-dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <TeacherForm />
        </motion.div>
      </div>
    </div>
  );
};

export default CreateSession;
