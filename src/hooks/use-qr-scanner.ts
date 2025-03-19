
import { useState } from "react";
import { toast } from "sonner";
import { validateQrCode, markStudentAttendance } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { QRData } from "@/types";

export enum ScanState {
  IDLE = "idle",
  SCANNING = "scanning",
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error"
}

export const useQRScanner = () => {
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
    try {
      if (!user) {
        throw new Error("You must be logged in to scan attendance QR codes");
      }

      setScanState(ScanState.PROCESSING);

      // Parse QR data
      let parsedData: QRData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (err) {
        throw new Error("Invalid QR code format");
      }

      // Validate QR data
      const validation = await validateQrCode(parsedData, user.id);
      
      if (!validation.valid || !validation.event) {
        throw new Error(validation.error || "Invalid QR code");
      }

      // Mark student attendance
      const result = await markStudentAttendance(
        validation.event.id,
        {
          id: user.id,
          name: user.name,
          rollNo: user.role === 'student' ? user.rollNo || "" : "",
          sapId: user.role === 'student' ? user.sapId || "" : ""
        }
      );

      if (!result.success) {
        throw new Error("Failed to mark attendance");
      }

      // Success
      setScanState(ScanState.SUCCESS);
      toast.success("Attendance marked successfully!");
      
    } catch (error: any) {
      setScanState(ScanState.ERROR);
      setErrorMessage(error.message || "Failed to process QR code");
      toast.error(error.message || "Failed to process QR code");
    }
  };

  const handleScanError = (error: any) => {
    setScanState(ScanState.ERROR);
    setErrorMessage(error.message || "Failed to scan QR code");
    toast.error(error.message || "Failed to scan QR code");
  };

  return {
    scanState,
    errorMessage,
    startScanning,
    cancelScanning,
    processQRData,
    handleScanError
  };
};
