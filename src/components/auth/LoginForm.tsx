
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Loader2, Info } from "lucide-react";

const LoginForm = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === "teacher") {
      // For teachers, we only need name (not email) and password
      if (!email || !password) {
        toast.error("Please provide your name and password");
        return;
      }
    } else {
      // For students, we need email and password
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }
    }

    try {
      await login(email, password, role);
    } catch (error) {
      // Error is handled in the login function
      console.error("Login error:", error);
    }
  };

  return (
    <Card className="w-full max-w-md glass-card animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Sign in to your {role} account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {role === "teacher" && (
            <div className="p-3 bg-secondary/30 rounded-md flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                Teachers: Enter your name and the provided password to login. Only authorized faculty members can log in.
              </div>
            </div>
          )}

          {role === "student" && (
            <div className="p-3 bg-secondary/30 rounded-md flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                Students: You must sign up before logging in. Your attendance will be filtered based on your department and year.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">
              {role === "teacher" ? "Teacher Name" : "Email"}
            </Label>
            <Input
              id="email"
              placeholder={role === "teacher" ? "e.g. Dr. Nilesh Salunke" : "name@example.com"}
              type={role === "teacher" ? "text" : "email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-input"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {role === "student" ? (
            <>
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Only authorized faculty members can login.
              <br/>
              Contact the administrator if you need access.
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
