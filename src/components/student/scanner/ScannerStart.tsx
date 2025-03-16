
import React from 'react';
import { Button } from '@/components/ui/button';

interface ScannerStartProps {
  onStart: () => void;
}

const ScannerStart: React.FC<ScannerStartProps> = ({ onStart }) => {
  return (
    <div className="flex justify-center">
      <Button onClick={onStart} className="w-full max-w-xs hover-scale">
        Start Scanning
      </Button>
    </div>
  );
};

export default ScannerStart;
