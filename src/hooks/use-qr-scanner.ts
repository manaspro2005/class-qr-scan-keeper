
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { QRData, Student } from '@/types';
import { useAuth } from '@/lib/auth';

export function useQRScanner() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Reset states when hook unmounts
  useEffect(() => {
    return () => {
      setScanning(false);
      setSuccess(false);
      setError(null);
      setProcessing(false);
    };
  }, []);

  const handleScan = async (data: string) => {
    if (!data || processing) return;
    
    try {
      setProcessing(true);
      setScanning(false);
      
      console.log('QR Data:', data);
      
      // Decode QR data
      let qrData: QRData;
      try {
        qrData = JSON.parse(data);
      } catch (e) {
        throw new Error('Invalid QR code format');
      }
      
      // Check if QR code is expired
      const expiry = new Date(qrData.expiry);
      if (new Date() > expiry) {
        throw new Error('QR code has expired');
      }
      
      // Check for prank QR code
      if (qrData.secret === 'prank') {
        throw new Error('Oops! You got fooled. This is a fake QR code.');
      }
      
      // Get student data
      const student = user as Student;
      if (!student) {
        throw new Error('Student data not found');
      }
      
      // Check if student is eligible for this attendance (matching department and year)
      if (student.department !== qrData.department || student.year !== qrData.year) {
        throw new Error(`This attendance is for ${qrData.department} Year ${qrData.year} students only`);
      }
      
      // Mark attendance
      const attendance = {
        studentId: student.id,
        name: student.name,
        rollNo: student.rollNo,
        sapId: student.sapId,
        scanTime: new Date(),
        present: true
      };
      
      // Save attendance to event in localStorage
      const storedEvents = localStorage.getItem('attendanceEvents') || '[]';
      const events = JSON.parse(storedEvents);
      
      // Find the event
      const eventIndex = events.findIndex((e: any) => e.id === qrData.eventId);
      
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }
      
      // Check if student already marked attendance
      if (events[eventIndex].attendees.some((a: any) => a.studentId === student.id)) {
        throw new Error('You have already marked your attendance for this session');
      }
      
      // Add attendance to event
      events[eventIndex].attendees.push(attendance);
      
      // Save updated events
      localStorage.setItem('attendanceEvents', JSON.stringify(events));
      
      // Show success
      setSuccess(true);
      toast.success('Attendance marked successfully');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setProcessing(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Scan error:', error);
      setError(error.message || 'Failed to process QR code');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setError(null);
        setProcessing(false);
      }, 3000);
    }
  };

  const handleError = (err: any) => {
    console.error('Scanner error:', err);
    toast.error('Scanner error: ' + err.message);
    setScanning(false);
  };

  const startScanning = () => {
    setScanning(true);
    setError(null);
    setSuccess(false);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  return {
    scanning,
    success,
    error,
    processing,
    handleScan,
    handleError,
    startScanning,
    stopScanning
  };
}
