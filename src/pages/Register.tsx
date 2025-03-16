
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical"
];

const YEARS = ["1", "2", "3", "4"];

const Register = () => {
  const navigate = useNavigate();
  const { register, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"teacher" | "student">("student");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    department: "",
    year: "",
    rollNo: "",
    sapId: "",
    phone: ""
  });

  // If already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    }
  }, [user, authLoading, navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form based on role
      if (!formData.email || !formData.password || !formData.name) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (role === "student") {
        if (!formData.department || !formData.year || !formData.rollNo || !formData.sapId) {
          toast.error("Please fill in all student details");
          return;
        }
      }
      
      // Register user
      await register({
        ...formData,
        role
      });
      
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

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
        >
          <Card className="w-full glass-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Register as a {role}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as "teacher" | "student")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teacher" id="teacher" />
                    <Label htmlFor="teacher">Teacher</Label>
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>
                
                {role === "teacher" && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 1234567890"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="glass-input"
                    />
                  </div>
                )}

                {role === "student" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleChange("department", value)}
                        >
                          <SelectTrigger className="glass-input">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEPARTMENTS.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select
                          value={formData.year}
                          onValueChange={(value) => handleChange("year", value)}
                        >
                          <SelectTrigger className="glass-input">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {YEARS.map((year) => (
                              <SelectItem key={year} value={year}>
                                Year {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rollNo">Roll Number</Label>
                        <Input
                          id="rollNo"
                          placeholder="e.g. CS2021001"
                          value={formData.rollNo}
                          onChange={(e) => handleChange("rollNo", e.target.value)}
                          className="glass-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sapId">SAP ID</Label>
                        <Input
                          id="sapId"
                          placeholder="e.g. 500123456"
                          value={formData.sapId}
                          onChange={(e) => handleChange("sapId", e.target.value)}
                          className="glass-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
