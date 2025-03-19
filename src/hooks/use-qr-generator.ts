
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { QRData } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useQRGenerator() {
  const [eventData, setEventData] = useState<any>(null);
  const [qrData, setQrData] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Get event data from session storage
    const savedEventData = sessionStorage.getItem("attendanceEvent");
    
    if (!savedEventData) {
      toast.error("No event data found");
      return null;
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
      saveEventToSupabase(parsedEventData, qrDataObj, expiry);
      
      return parsedEventData;
    } catch (error) {
      console.error("Failed to parse event data:", error);
      toast.error("Invalid event data");
      return null;
    }
  }, []);

  const saveEventToSupabase = async (parsedEventData: any, qrDataObj: QRData, expiry: Date) => {
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
      
      // Convert QRData to a plain object that can be stored as JSON
      const qrDataForStorage = JSON.parse(JSON.stringify(qrDataObj));
      
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
          qr_data: qrDataForStorage,
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

  return {
    eventData,
    qrData,
    expiryDate,
    downloadQRCode,
    copyQRData,
    generateFakeQR
  };
}
