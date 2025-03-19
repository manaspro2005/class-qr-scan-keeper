
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface QRActionsProps {
  downloadQRCode: () => void;
  copyQRData: () => void;
  generateFakeQR: () => void;
}

const QRActions: React.FC<QRActionsProps> = ({
  downloadQRCode,
  copyQRData,
  generateFakeQR,
}) => {
  return (
    <>
      <div className="flex gap-2 w-full">
        <Button onClick={downloadQRCode} className="flex-1" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button onClick={copyQRData} className="flex-1" variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Copy Data
        </Button>
      </div>

      <Button onClick={generateFakeQR} variant="secondary" className="w-full">
        Generate Anti-Sharing QR Data
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-2">
        This QR code will expire in 5 minutes. Students must scan it with this app only.
      </p>
    </>
  );
};

export default QRActions;
