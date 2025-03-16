
import { useState, useEffect } from 'react';
import { Scanner as QRCodeScanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { QRData, Student } from '@/types';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

const Scanner = () => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Reset states when component unmounts
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
      
      // In a real app, you would send this to your API
      // For demo, we'll update local storage
      
      // Get student data
      const student = user as Student;
      if (!student) {
        throw new Error('Student data not found');
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

  return (
    <Card className="w-full max-w-md glass-card animate-slide-in">
      <CardHeader>
        <CardTitle className="text-xl text-center">QR Scanner</CardTitle>
        <CardDescription className="text-center">
          Scan the QR code shown by your teacher to mark attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanning && !success && !error && !processing && (
          <div className="flex justify-center">
            <Button onClick={startScanning} className="w-full max-w-xs hover-scale">
              Start Scanning
            </Button>
          </div>
        )}

        {processing && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-center text-muted-foreground">Processing...</p>
          </div>
        )}

        {scanning && (
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-lg"
            >
              <QRCodeScanner
                onScan={handleScan}
                onError={handleError}
                containerStyle={{ borderRadius: '0.5rem', overflow: 'hidden' }}
              />
            </motion.div>
            
            <Button 
              variant="outline" 
              onClick={stopScanning}
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your attendance has been marked successfully.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default Scanner;
