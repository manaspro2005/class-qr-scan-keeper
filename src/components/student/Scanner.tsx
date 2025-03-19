
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQRScanner, ScanState } from '@/hooks/use-qr-scanner';
import ScannerStart from './scanner/ScannerStart';
import ScannerProcessing from './scanner/ScannerProcessing';
import ScannerActive from './scanner/ScannerActive';
import ScannerSuccess from './scanner/ScannerSuccess';
import ScannerError from './scanner/ScannerError';

const Scanner = () => {
  const {
    scanState,
    errorMessage,
    startScanning,
    cancelScanning,
    processQRData,
    handleScanError
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
        {scanState === ScanState.IDLE && (
          <ScannerStart onStart={startScanning} />
        )}

        {scanState === ScanState.PROCESSING && <ScannerProcessing />}

        {scanState === ScanState.SCANNING && (
          <ScannerActive 
            onScan={processQRData} 
            onError={handleScanError} 
            onCancel={cancelScanning} 
          />
        )}

        {scanState === ScanState.SUCCESS && <ScannerSuccess />}

        {scanState === ScanState.ERROR && <ScannerError errorMessage={errorMessage} />}
      </CardContent>
    </Card>
  );
};

export default Scanner;
