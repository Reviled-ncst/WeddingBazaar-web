import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { Download, Copy, RefreshCw } from 'lucide-react';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  title?: string;
  description?: string;
  showDownload?: boolean;
  showCopy?: boolean;
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  size = 200,
  title = "QR Code",
  description,
  showDownload = true,
  showCopy = true,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [data, size]);

  const generateQRCode = async () => {
    if (!data || !canvasRef.current) return;

    setLoading(true);
    setError('');

    try {
      const canvas = canvasRef.current;
      
      // Generate QR code on canvas
      await QRCode.toCanvas(canvas, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Convert canvas to data URL for downloading
      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeDataUrl(dataUrl);
      
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = 'payment-qrcode.png';
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      // You could add a toast notification here
      console.log('QR code data copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex flex-col items-center justify-center p-8 ${className}`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"
        />
        <p className="text-gray-600">Generating QR Code...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex flex-col items-center justify-center p-8 ${className}`}
      >
        <div className="text-red-600 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Failed to Generate QR Code</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={generateQRCode}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center space-y-4 ${className}`}
    >
      {/* Title */}
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}

      {/* QR Code */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <canvas
          ref={canvasRef}
          className="block"
          width={size}
          height={size}
        />
      </div>

      {/* Action Buttons */}
      {(showDownload || showCopy) && (
        <div className="flex gap-3">
          {showDownload && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
          )}
          
          {showCopy && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default QRCodeDisplay;
