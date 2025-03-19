
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCodeDisplay from "@/components/ui/qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useProtectedRoute } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { motion } from "framer-motion";
import { QRData } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const QRGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading } = useProtectedRoute("teacher");
  
  const [eventData, setEventData] = useState<any>(null);
  const [qrData, setQrData] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    // Get event data from session storage
    const savedEventData = sessionStorage.getItem("attendanceEvent");
    
    if (!savedEventData) {
      toast.error("No event data found");
      navigate("/create-session");
      return;
    }
    
    try {
      const parsedEventData = JSON.parse(savedEventData);
      setEventData(parsedEventData);
      
      // Generate QR data
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 5); // 5 minute expiration
      
      const qrDataObj: QRData = {
        eventId: parsedEventData.id,
        teacherId: parsedEventData.teacherId,
        room: parsedEventData.room,
        subject: parsedEventData.subject,
        department: parsedEventData.department,
        year: parsedEventData.year,
        expiry: expiry,
        secret: "valid" // Used to verify real QR codes
      };
      
      setQrData(JSON.stringify(qrDataObj));
      setExpiryDate(expiry);
      
      // Store attendance event in Supabase
      const saveEvent = async () => {
        if (saving) return;
        setSaving(true);
        
        try {
          // Check if event already exists in Supabase
          const { data: existingEvents } = await supabase
            .from('attendance_events')
            .select('id')
            .eq('id', parsedEventData.id)
            .single();
          
          if (existingEvents) {
            console.log("Event already exists in Supabase:", parsedEventData.id);
            setSaving(false);
            return;
          }
          
          // Insert event into Supabase
          const { error } = await supabase
            .from('attendance_events')
            .insert({
              id: parsedEventData.id,
              teacher_id: parsedEventData.teacherId,
              teacher_name: parsedEventData.teacherName,
              subject: parsedEventData.subject,
              room: parsedEventData.room,
              department: parsedEventData.department,
              year: parsedEventData.year,
              date: parsedEventData.date,
              time: parsedEventData.time,
              qr_data: qrDataObj,
              qr_expiry: expiry.toISOString()
            });
          
          if (error) {
            console.error('Error saving event to Supabase:', error);
            toast.error('Failed to save event');
          } else {
            console.log("Event saved to Supabase:", parsedEventData.id);
          }
        } catch (error) {
          console.error('Error in saveEvent:', error);
          toast.error('Failed to save event');
        } finally {
          setSaving(false);
        }
      };
      
      saveEvent();
      
    } catch (error) {
      console.error("Failed to parse event data:", error);
      toast.error("Invalid event data");
      navigate("/create-session");
    }
  }, [navigate, user]);

  const downloadQRCode = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      toast.error("Could not download QR code");
      return;
    }
    
    const link = document.createElement("a");
    link.download = `qr-code-${eventData?.subject}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast.success("QR code downloaded");
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData);
    toast.success("QR data copied to clipboard");
  };

  const generateFakeQR = () => {
    // Create a fake QR code for when a student shares it
    const fakeQrData: QRData = {
      ...JSON.parse(qrData),
      secret: "prank" // This will trigger the prank message
    };
    
    navigator.clipboard.writeText(JSON.stringify(fakeQrData));
    toast.success("Prank QR data copied to clipboard");
  };

  if (loading || !eventData) {
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>QR Code Generated</CardTitle>
              <CardDescription>
                Show this QR code to your students to mark attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white/50 p-2 rounded-lg shadow-sm">
                <QRCodeDisplay 
                  value={qrData} 
                  size={250} 
                  expiry={expiryDate}
                />
              </div>
              
              <div className="w-full space-y-2 mt-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subject:</span>
                    <p className="font-medium">{eventData.subject}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Room:</span>
                    <p className="font-medium">{eventData.room}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{eventData.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <p className="font-medium">{eventData.year}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{eventData.date}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">{eventData.time}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={downloadQRCode} 
                  className="flex-1"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  onClick={copyQRData} 
                  className="flex-1"
                  variant="outline"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Data
                </Button>
              </div>
              
              <Button 
                onClick={generateFakeQR} 
                variant="secondary"
                className="w-full"
              >
                Generate Anti-Sharing QR Data
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                This QR code will expire in 5 minutes. Students must scan it with this app only.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QRGenerator;
