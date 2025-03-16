
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  expiry?: Date;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  className,
  expiry
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Generate QR code on mount or when value changes
  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };

    generateQR();
  }, [value, size]);

  // Set up countdown timer if expiry is provided
  useEffect(() => {
    if (!expiry) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiry.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        return;
      }
      
      setTimeLeft(Math.floor(difference / 1000));
    };

    calculateTimeLeft();
    const timerId = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, [expiry]);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn("overflow-hidden glass-card", className)}>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        {qrUrl && (
          <div className="relative">
            <div className={cn(
              "transition-all duration-500 bg-white p-2 rounded-md",
              isExpired ? "opacity-30 blur-sm" : "hover-scale"
            )}>
              <img 
                src={qrUrl} 
                alt="QR Code"
                width={size}
                height={size}
                className="rounded"
              />
            </div>
            
            {isExpired && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-lg font-semibold text-red-500 bg-white/80 px-4 py-2 rounded animate-pulse-soft">
                  QR Code Expired
                </p>
              </div>
            )}
          </div>
        )}
        
        {timeLeft !== null && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">QR Code expires in:</p>
            <p className={cn(
              "text-xl font-bold",
              timeLeft < 60 ? "text-red-500" : timeLeft < 120 ? "text-amber-500" : "text-green-500"
            )}>
              {formatTime(timeLeft)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
