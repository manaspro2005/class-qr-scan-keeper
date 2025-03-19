
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import QRDisplayCard from "@/components/qr/QRDisplayCard";
import { useQRGenerator } from "@/hooks/use-qr-generator";
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const QRGenerator = () => {
  const navigate = useNavigate();
  const { loading } = useProtectedRoute("teacher");
  
  const {
    eventData,
    qrData,
    expiryDate,
    downloadQRCode,
    copyQRData,
    generateFakeQR
  } = useQRGenerator();

  // Save attendance event to Supabase when the component loads
  useEffect(() => {
    const saveAttendanceEvent = async () => {
      if (eventData && qrData) {
        try {
          // Convert qrData to a plain object before storing
          const qrDataObj = JSON.parse(JSON.stringify(qrData));
          
          // Insert the attendance event into Supabase
          const { error } = await supabase
            .from('attendance_events')
            .insert({
              teacher_id: eventData.teacherId,
              teacher_name: eventData.teacherName,
              subject: eventData.subject,
              room: eventData.room,
              department: eventData.department,
              year: eventData.year,
              date: eventData.date,
              time: eventData.time,
              qr_data: qrDataObj,
              qr_expiry: expiryDate.toISOString(),
            });
            
          if (error) {
            console.error("Error saving attendance event:", error);
            toast.error("Failed to save attendance session");
          } else {
            console.log("Attendance event saved successfully");
            toast.success("Attendance session created successfully");
          }
        } catch (err) {
          console.error("Error in saveAttendanceEvent:", err);
          toast.error("Failed to process attendance data");
        }
      }
    };

    saveAttendanceEvent();
  }, [eventData, qrData, expiryDate]);

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
        
        <QRDisplayCard
          eventData={eventData}
          qrData={qrData}
          expiryDate={expiryDate}
          downloadQRCode={downloadQRCode}
          copyQRData={copyQRData}
          generateFakeQR={generateFakeQR}
        />
      </div>
    </div>
  );
};

export default QRGenerator;
