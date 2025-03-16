
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./auth-context";

// Protected route utility
export const useProtectedRoute = (allowedRole?: 'teacher' | 'student') => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("You must be logged in to access this page");
      navigate("/login");
      return;
    }

    if (!loading && allowedRole && user?.role !== allowedRole) {
      toast.error(`Only ${allowedRole}s can access this page`);
      navigate(user?.role === 'teacher' ? "/teacher-dashboard" : "/student-dashboard");
    }
  }, [user, loading, navigate, allowedRole]);

  return { user, loading };
};
