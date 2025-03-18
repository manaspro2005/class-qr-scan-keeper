
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Teacher, Student } from "@/types";
import { toast } from "sonner";
import { AuthContext } from "./auth-context";
import { ALLOWED_TEACHERS, TEACHER_PASSWORD } from "./constants";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from local storage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Mock login function - in a real app, this would call your API
  const login = async (emailOrName: string, password: string, role: 'teacher' | 'student') => {
    try {
      setLoading(true);
      
      // For teacher login, validate against allowed teachers
      if (role === 'teacher') {
        // For teachers, we're searching by name (not email)
        const nameInput = emailOrName.trim();
        
        // Find exact match or partial match with teacher name
        const teacherMatch = ALLOWED_TEACHERS.find(teacherName => 
          teacherName.toLowerCase() === nameInput.toLowerCase() || 
          teacherName.toLowerCase().includes(nameInput.toLowerCase()));
        
        if (!teacherMatch) {
          throw new Error("Teacher not found in authorized list");
        }
        
        if (password !== TEACHER_PASSWORD) {
          throw new Error("Invalid teacher password");
        }
        
        const teacher: Teacher = {
          id: `teacher-${Date.now()}`,
          email: `${teacherMatch.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Generate email from name
          name: teacherMatch,
          role: 'teacher',
          verified: true
        };
        
        setUser(teacher);
        localStorage.setItem("user", JSON.stringify(teacher));
        toast.success(`Welcome, ${teacherMatch}`);
        navigate("/teacher-dashboard");
      } else {
        // Student login is simpler for now
        const email = emailOrName;
        
        // Get the existing users from localStorage
        const existingUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const matchedUser = existingUsers.find((u: any) => 
          u.email === email && u.role === 'student'
        );
        
        if (matchedUser) {
          setUser(matchedUser);
          localStorage.setItem("user", JSON.stringify(matchedUser));
          toast.success("Student login successful");
          navigate("/student-dashboard");
        } else {
          throw new Error("Student not found. Please register first.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock registration function
  const register = async (userData: any) => {
    try {
      setLoading(true);
      
      if (userData.role === 'teacher') {
        // Verify teacher is in allowed list
        const nameMatch = ALLOWED_TEACHERS.find(name => 
          name.toLowerCase() === userData.name.toLowerCase());
        
        if (!nameMatch) {
          throw new Error("Teacher name not in allowed list");
        }
      }
      
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        department: userData.department,
        year: userData.year,
        rollNo: userData.rollNo,
        sapId: userData.sapId,
        phone: userData.phone,
        verified: userData.role === 'teacher' // Teachers are auto-verified
      };
      
      // Store in local storage array of all users
      const existingUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      
      // Check if email already exists
      if (existingUsers.some((u: any) => u.email === userData.email)) {
        throw new Error("Email already registered");
      }
      
      existingUsers.push(newUser);
      localStorage.setItem("allUsers", JSON.stringify(existingUsers));
      
      // Also set as current user
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      toast.success("Registration successful");
      
      // Redirect based on role
      if (newUser.role === 'teacher') {
        navigate("/teacher-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    
    // Fix: Always navigate to the root route when logging out
    // This ensures we don't have route permission issues
    navigate("/");
  };

  // Clear all users from localStorage (for testing)
  const resetUsers = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("allUsers");
      toast.success("All users have been reset for testing");
    } catch (error) {
      console.error("Failed to reset users:", error);
      toast.error("Failed to reset users");
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = () => user?.role === 'teacher';
  const isStudent = () => user?.role === 'student';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      resetUsers,
      isTeacher,
      isStudent
    }}>
      {children}
    </AuthContext.Provider>
  );
};
