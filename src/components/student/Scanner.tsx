
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQRScanner } from '@/hooks/use-qr-scanner';
import ScannerStart from './scanner/ScannerStart';
import ScannerProcessing from './scanner/ScannerProcessing';
import ScannerActive from './scanner/ScannerActive';
import ScannerSuccess from './scanner/ScannerSuccess';
import ScannerError from './scanner/ScannerError';

const Scanner = () => {
  const {
    scanning,
    success,
    error,
    processing,
    handleScan,
    handleError,
    startScanning,
    stopScanning
  } = useQRScanner();

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
          <ScannerStart onStart={startScanning} />
        )}

        {processing && <ScannerProcessing />}

        {scanning && (
          <ScannerActive 
            onScan={handleScan} 
            onError={handleError} 
            onCancel={stopScanning} 
          />
        )}

        {success && <ScannerSuccess />}

        {error && <ScannerError errorMessage={error} />}
      </CardContent>
    </Card>
  );
};

export default Scanner;
