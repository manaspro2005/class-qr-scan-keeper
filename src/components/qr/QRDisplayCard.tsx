
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import QRCodeDisplay from "@/components/ui/qr-code";
import EventDetails from "./EventDetails";
import QRActions from "./QRActions";
import { motion } from "framer-motion";

interface QRDisplayCardProps {
  eventData: any;
  qrData: string;
  expiryDate?: Date;
  downloadQRCode: () => void;
  copyQRData: () => void;
  generateFakeQR: () => void;
}

const QRDisplayCard: React.FC<QRDisplayCardProps> = ({
  eventData,
  qrData,
  expiryDate,
  downloadQRCode,
  copyQRData,
  generateFakeQR
}) => {
  return (
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
          
          <EventDetails eventData={eventData} />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <QRActions
            downloadQRCode={downloadQRCode}
            copyQRData={copyQRData}
            generateFakeQR={generateFakeQR}
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default QRDisplayCard;
