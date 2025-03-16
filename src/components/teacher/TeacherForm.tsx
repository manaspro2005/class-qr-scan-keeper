
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth";
import { AttendanceFormData } from "@/types";
import { Clock, Calendar } from "lucide-react";

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical"
];

const YEARS = ["1", "2", "3", "4"];

const TeacherForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AttendanceFormData>({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    room: "",
    subject: "",
    department: "",
    year: ""
  });

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  const handleChange = (field: keyof AttendanceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.room || !formData.subject || !formData.department || !formData.year) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, this would send data to your API
      // For now, we'll just simulate success and navigate to QR generation
      
      // Create event object to pass to QR generator
      const eventData = {
        ...formData,
        teacherId: user?.id || "",
        teacherName: user?.name || "",
        date: currentDate,
        id: `event-${Date.now()}`
      };
      
      // Store event data in session storage to use on QR generator page
      sessionStorage.setItem("attendanceEvent", JSON.stringify(eventData));
      
      toast.success("Form submitted successfully");
      navigate("/generate-qr");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md glass-card animate-slide-in">
      <CardHeader>
        <CardTitle className="text-xl text-center">Create Attendance Session</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date
              </Label>
              <Input
                id="date"
                type="date"
                value={currentDate}
                readOnly
                className="glass-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Room Number</Label>
            <Input
              id="room"
              placeholder="e.g. 101, A-203"
              value={formData.room}
              onChange={(e) => handleChange("room", e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g. Computer Networks"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange("department", value)}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Select department" />
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
                <SelectValue placeholder="Select year" />
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
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          form="teacher-form" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? "Processing..." : "Generate QR Code"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeacherForm;
