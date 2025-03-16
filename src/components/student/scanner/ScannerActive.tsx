
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Scanner as QRCodeScanner } from '@yudiel/react-qr-scanner';

interface ScannerActiveProps {
  onScan: (data: string) => Promise<void>;
  onError: (err: any) => void;
  onCancel: () => void;
}

const ScannerActive: React.FC<ScannerActiveProps> = ({ onScan, onError, onCancel }) => {
  // Function to adapt the Scanner library's callback to our expected format
  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0];
      if (code && code.rawValue) {
        onScan(code.rawValue);
      }
    }
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-lg"
      >
        <QRCodeScanner
          onScan={handleScan}
          onError={onError}
          className="rounded-lg overflow-hidden"
        />
      </motion.div>
      
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="mt-4 w-full"
      >
        Cancel
      </Button>
    </div>
  );
};

export default ScannerActive;
