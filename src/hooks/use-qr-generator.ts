
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type QRData = {
  eventId: string;
  token: string;
  expiry: Date;
  fake?: boolean;
};

export function useQRGenerator() {
  const { user } = useAuth();
  const [eventData, setEventData] = useState<any>(null);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date>(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes from now

  // Load event data from sessionStorage
  useEffect(() => {
    const storedEvent = sessionStorage.getItem('attendanceEvent');
    if (storedEvent) {
      try {
        const parsedEvent = JSON.parse(storedEvent);
        console.log("Loaded stored event:", parsedEvent);
        setEventData(parsedEvent);
        
        // Create the real QR data
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        setExpiryDate(expiry);
        
        // If we already have an event ID, use it; otherwise, create a UUID
        const eventId = parsedEvent.id || uuidv4();
        
        const qrDataObj: QRData = {
          eventId,
          token: uuidv4(), // Generate a unique token for security
          expiry
        };
        
        setQrData(qrDataObj);
      } catch (error) {
        console.error("Failed to parse stored event:", error);
        sessionStorage.removeItem('attendanceEvent');
      }
    }
  }, []);

  // Function to download the QR code as an image
  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    const qrImage = document.querySelector('.qrcode img') as HTMLImageElement;
    
    if (qrImage) {
      // Create a virtual link element
      const link = document.createElement('a');
      link.download = `qr-attendance-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = qrImage.src;
      link.click();
      toast.success("QR Code downloaded");
    } else {
      toast.error("QR Code not found");
    }
  };

  // Function to copy the QR data to clipboard
  const copyQRData = () => {
    if (qrData) {
      navigator.clipboard.writeText(JSON.stringify(qrData))
        .then(() => toast.success("QR data copied to clipboard"))
        .catch(() => toast.error("Failed to copy"));
    }
  };

  // Generate a fake QR code for demonstration/testing
  const generateFakeQR = () => {
    if (qrData) {
      // Create a new QR code with the same data but marked as fake
      const fakeQRData: QRData = {
        ...qrData,
        fake: true,
        token: uuidv4(), // New token to make it unique
      };
      
      setQrData(fakeQRData);
      toast.info("Generated anti-sharing QR data");
    }
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
