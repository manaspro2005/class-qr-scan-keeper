
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AttendanceEvent } from "@/types";
import { Download, ArrowLeft, Search, UserCheck, UserX } from "lucide-react";
import { useState, useMemo } from "react";

interface AttendanceDetailsProps {
  event: AttendanceEvent;
  onClose: () => void;
  onExport: () => void;
}

const AttendanceDetails = ({ event, onClose, onExport }: AttendanceDetailsProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sort attendees by roll number
  const sortedAttendees = useMemo(() => {
    return [...event.attendees].sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  }, [event.attendees]);

  // Filter attendees based on search term
  const filteredAttendees = useMemo(() => {
    if (!searchTerm) return sortedAttendees;
    
    const term = searchTerm.toLowerCase();
    return sortedAttendees.filter(
      attendee => 
        attendee.name.toLowerCase().includes(term) || 
        attendee.rollNo.toLowerCase().includes(term) ||
        attendee.sapId.toLowerCase().includes(term)
    );
  }, [sortedAttendees, searchTerm]);

  // Calculate present and absent counts
  const presentCount = sortedAttendees.filter(a => a.present).length;
  const absentCount = sortedAttendees.filter(a => !a.present).length;
  const attendancePercentage = Math.round((presentCount / (presentCount + absentCount)) * 100) || 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="gap-1 px-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <Button 
            size="sm" 
            className="gap-1.5"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            <span>Export to Excel</span>
          </Button>
        </div>
        
        <CardTitle className="mt-4">{event.subject} Attendance</CardTitle>
        <CardDescription>
          {event.date} at {event.time} • Room {event.room} • {event.department} Year {event.year}
        </CardDescription>
        
        <div className="grid grid-cols-3 gap-4 my-4">
          <Card className="bg-background/50">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{sortedAttendees.length}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-sm text-green-600/80">Present</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-sm text-red-600/80">Absent</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${attendancePercentage}%` }} 
          />
        </div>
        <div className="text-sm text-muted-foreground text-center mt-1">
          {attendancePercentage}% Attendance
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, roll number or SAP ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="rounded-md border">
          <div className="grid grid-cols-9 gap-2 p-3 bg-muted/50 font-medium text-sm">
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Roll No</div>
            <div className="col-span-2">SAP ID</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-1">Time</div>
          </div>
          
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {filteredAttendees.map((attendee, index) => (
              <div 
                key={attendee.studentId} 
                className={`grid grid-cols-9 gap-2 p-3 text-sm ${index % 2 === 1 ? 'bg-muted/20' : ''}`}
              >
                <div className="col-span-1">
                  {attendee.present ? (
                    <span className="text-green-600 flex items-center">
                      <UserCheck className="h-4 w-4 mr-1" />
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <UserX className="h-4 w-4 mr-1" />
                    </span>
                  )}
                </div>
                <div className="col-span-2 font-medium">{attendee.rollNo}</div>
                <div className="col-span-2">{attendee.sapId}</div>
                <div className="col-span-3">{attendee.name}</div>
                <div className="col-span-1 text-muted-foreground">
                  {attendee.present 
                    ? new Date(attendee.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : '-'}
                </div>
              </div>
            ))}
            
            {filteredAttendees.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                No matching students found
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceDetails;
