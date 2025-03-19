
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import QRDisplayCard from "@/components/qr/QRDisplayCard";
import { useQRGenerator } from "@/hooks/use-qr-generator";

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
