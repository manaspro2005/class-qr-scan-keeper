
import React from 'react';
import { Loader2 } from 'lucide-react';

const ScannerProcessing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-center text-muted-foreground">Processing...</p>
    </div>
  );
};

export default ScannerProcessing;
