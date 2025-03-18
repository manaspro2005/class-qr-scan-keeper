
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
          // Get additional user information from auth metadata
          const { data: authUser } = await supabase.auth.getUser();
          const userData = authUser?.user?.user_metadata;
          
          if (userData) {
            const userRole = userData.user_type as 'student' | 'teacher';
            
            if (userRole === 'student') {
              const { data: studentData } = await supabase
                .from('students')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
              if (studentData) {
                setUser({
                  id: session.user.id,
                  email: userData.email || authUser.user.email || '',
                  name: userData.full_name || '',
                  role: 'student',
                  department: studentData.department,
                  year: studentData.year,
                  rollNo: studentData.roll_number,
                  sapId: studentData.sap_id,
                  verified: true
                });
              } else {
                // Create student record if it doesn't exist
                try {
                  const { data: newStudent } = await supabase
                    .from('students')
                    .insert({
                      id: session.user.id,
                      name: userData.full_name || '',
                      email: userData.email || authUser.user.email || '',
                      department: userData.department || '',
                      year: userData.year || '',
                      roll_number: userData.roll_number || '',
                      sap_id: userData.sap_id || '',
                      phone: userData.phone || ''
                    })
                    .select()
                    .single();
                    
                  if (newStudent) {
                    setUser({
                      id: session.user.id,
                      email: newStudent.email,
                      name: newStudent.name,
                      role: 'student',
                      department: newStudent.department,
                      year: newStudent.year,
                      rollNo: newStudent.roll_number,
                      sapId: newStudent.sap_id,
                      verified: true
                    });
                  }
                } catch (error) {
                  console.error("Error creating student record:", error);
                }
              }
            } else if (userRole === 'teacher') {
              const { data: teacherData } = await supabase
                .from('teachers')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
              if (teacherData) {
                setUser({
                  id: session.user.id,
                  email: userData.email || authUser.user.email || '',
                  name: userData.full_name || '',
                  role: 'teacher',
                  department: userData.department,
                  verified: true
                });
              } else {
                // Create teacher record if it doesn't exist
                try {
                  const { data: newTeacher } = await supabase
                    .from('teachers')
                    .insert({
                      id: session.user.id,
                      name: userData.full_name || '',
                      email: userData.email || authUser.user.email || ''
                    })
                    .select()
                    .single();
                    
                  if (newTeacher) {
                    setUser({
                      id: session.user.id,
                      email: newTeacher.email,
                      name: newTeacher.name,
                      role: 'teacher',
                      department: userData.department,
                      verified: true
                    });
                  }
                } catch (error) {
                  console.error("Error creating teacher record:", error);
                }
              }
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
        const userRole = data.user.user_metadata.user_type;
        
        // Check if user is trying to log in with correct role
        if (userRole !== role) {
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
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            user_type: userData.role,
            full_name: userData.name,
            email: userData.email,
            department: userData.department,
            year: userData.year,
            roll_number: userData.rollNo,
            sap_id: userData.sapId,
            phone: userData.phone
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Create record in appropriate table
        if (userData.role === 'student') {
          await supabase
            .from('students')
            .insert({
              id: data.user.id,
              name: userData.name,
              email: userData.email,
              department: userData.department || '',
              year: userData.year || '',
              roll_number: userData.rollNo || '',
              sap_id: userData.sapId || '',
              phone: userData.phone || ''
            });
        } else {
          await supabase
            .from('teachers')
            .insert({
              id: data.user.id,
              name: userData.name,
              email: userData.email
            });
        }
        
        // Redirect based on role
        navigate(userData.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
        toast.success('Account created successfully');
      }
      
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
