
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

  // Determine the current state based on scanState enum
  const isScanning = scanState === ScanState.SCANNING;
  const isProcessing = scanState === ScanState.PROCESSING;
  const isSuccess = scanState === ScanState.SUCCESS;
  const isError = scanState === ScanState.ERROR;

  return (
    <Card className="w-full max-w-md glass-card animate-slide-in">
      <CardHeader>
        <CardTitle className="text-xl text-center">QR Scanner</CardTitle>
        <CardDescription className="text-center">
          Scan the QR code shown by your teacher to mark attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning && !isSuccess && !isError && !isProcessing && (
          <ScannerStart onStart={startScanning} />
        )}

        {isProcessing && <ScannerProcessing />}

        {isScanning && (
          <ScannerActive 
            onScan={processQRData} 
            onError={handleScanError} 
            onCancel={cancelScanning} 
          />
        )}

        {isSuccess && <ScannerSuccess />}

        {isError && <ScannerError errorMessage={errorMessage} />}
      </CardContent>
    </Card>
  );
};

export default Scanner;
