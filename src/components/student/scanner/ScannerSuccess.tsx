
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ScannerSuccess: React.FC = () => {
  return (
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
  );
};

export default ScannerSuccess;
