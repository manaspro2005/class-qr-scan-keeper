
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./auth-context";
import { supabase } from "@/integrations/supabase/client";
import { User, RegisterFormData } from "@/types";
import { toast } from "sonner";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setUser(null);
          } else if (profile) {
            // Get additional details based on user type
            if (profile.user_type === 'student') {
              const { data: studentProfile, error: studentError } = await supabase
                .from('student_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (studentError) {
                console.error("Error fetching student profile:", studentError);
              } else if (studentProfile) {
                setUser({
                  id: session.user.id,
                  email: profile.email,
                  name: profile.full_name,
                  role: 'student',
                  department: studentProfile.department,
                  year: studentProfile.year,
                  rollNo: studentProfile.roll_number,
                  sapId: studentProfile.sap_id,
                  verified: true
                });
              }
            } else if (profile.user_type === 'teacher') {
              const { data: teacherProfile } = await supabase
                .from('teacher_profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
              setUser({
                id: session.user.id,
                email: profile.email,
                name: profile.full_name,
                role: 'teacher',
                department: teacherProfile?.department,
                verified: true
              });
            }
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          checkSession();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: 'teacher' | 'student') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();

        // Check if user is trying to log in with correct role
        if (profile?.user_type !== role) {
          // Sign out
          await supabase.auth.signOut();
          toast.error(`This account is not registered as a ${role}.`);
          return;
        }

        // Redirect based on role
        navigate(role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
        toast.success('Logged in successfully');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterFormData) => {
    try {
      setLoading(true);
      
      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', userData.email);
        
      if (checkError) {
        throw checkError;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        toast.error('Email already in use');
        return;
      }
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            user_type: userData.role,
            full_name: userData.name,
            department: userData.department,
            year: userData.year,
            roll_number: userData.rollNo,
            sap_id: userData.sapId,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect based on role
      navigate(userData.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
      toast.success('Account created successfully');
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Failed to log out');
    }
  };

  const isTeacher = () => {
    return user?.role === 'teacher';
  };

  const isStudent = () => {
    return user?.role === 'student';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isTeacher,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
