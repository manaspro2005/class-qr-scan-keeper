
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export enum ScanState {
  IDLE = 'idle',
  SCANNING = 'scanning',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}

export function useQRScanner() {
  const { user } = useAuth();
  const [scanState, setScanState] = useState<ScanState>(ScanState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const startScanning = () => {
    setScanState(ScanState.SCANNING);
    setErrorMessage("");
  };

  const cancelScanning = () => {
    setScanState(ScanState.IDLE);
    setErrorMessage("");
  };

  const processQRData = async (qrData: string) => {
    if (!user) {
      setErrorMessage("User not authenticated");
      setScanState(ScanState.ERROR);
      return;
    }

    try {
      setScanState(ScanState.PROCESSING);
      
      // Parse the QR data
      const parsedData = JSON.parse(qrData);
      console.log("Parsed QR data:", parsedData);

      // Validate attendance data
      if (!parsedData.eventId || !parsedData.expiry || !parsedData.token) {
        throw new Error("Invalid QR code data");
      }

      // Convert expiry to Date if it's a string
      const expiryDate = typeof parsedData.expiry === 'string' 
        ? new Date(parsedData.expiry) 
        : parsedData.expiry;

      // Check if QR code has expired
      if (new Date() > expiryDate) {
        throw new Error("This QR code has expired");
      }

      // Get the event details from Supabase
      const { data: eventData, error: eventError } = await supabase
        .from('attendance_events')
        .select('*')
        .eq('id', parsedData.eventId)
        .single();

      if (eventError || !eventData) {
        console.error("Event fetch error:", eventError);
        throw new Error("Could not find the attendance session");
      }

      console.log("Found event:", eventData);

      // Check if student has already marked attendance
      const { data: existingRecord, error: recordError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('event_id', parsedData.eventId)
        .eq('student_id', user.id)
        .single();

      if (existingRecord) {
        throw new Error("You have already marked attendance for this session");
      }

      // Make sure student department and year match the event
      if (user.department !== eventData.department || user.year !== eventData.year) {
        throw new Error(`This attendance is for ${eventData.department} Year ${eventData.year} students only`);
      }

      // Save attendance record to Supabase
      const { error: saveError } = await supabase
        .from('attendance_records')
        .insert({
          event_id: parsedData.eventId,
          student_id: user.id,
          student_name: user.name,
          roll_no: user.rollNo,
          sap_id: user.sapId,
          present: true
        });

      if (saveError) {
        console.error("Error saving attendance:", saveError);
        throw new Error("Failed to record attendance");
      }

      // Success!
      setScanState(ScanState.SUCCESS);
      toast.success("Attendance marked successfully!");
      
      // Reset to idle state after a few seconds
      setTimeout(() => {
        setScanState(ScanState.IDLE);
      }, 3000);

    } catch (error: any) {
      console.error("QR scan error:", error);
      setErrorMessage(error.message || "Failed to process QR code");
      setScanState(ScanState.ERROR);
      
      // Reset to idle state after a few seconds
      setTimeout(() => {
        setScanState(ScanState.IDLE);
      }, 5000);
    }
  };

  const handleScanError = (error: any) => {
    console.error("Scanner error:", error);
    setErrorMessage("Failed to access camera");
    setScanState(ScanState.ERROR);
  };

  return {
    scanState,
    errorMessage,
    startScanning,
    cancelScanning,
    processQRData,
    handleScanError
  };
}
