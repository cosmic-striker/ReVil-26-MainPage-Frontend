/**
 * QR Code Component with Download Functionality
 */

"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  data: string | object;
  size?: number;
  filename?: string;
  className?: string;
  showDownloadButton?: boolean;
}

export default function QRCodeDisplay({
  data,
  size = 300,
  filename = "qr-code.png",
  className = "",
  showDownloadButton = true,
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrData = typeof data === "string" ? data : JSON.stringify(data);
        const url = await QRCode.toDataURL(qrData, {
          width: size,
          margin: 2,
          color: {
            dark: "#00f0ff",
            light: "#000000",
          },
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, [data, size]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-pulse text-primary">Generating QR Code...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="bg-black p-4 rounded-lg border border-primary/30">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center text-gray-500">
            Failed to generate QR code
          </div>
        )}
      </div>
      {showDownloadButton && qrCodeUrl && (
        <button
          onClick={handleDownload}
          className="w-full px-4 py-3 bg-primary text-black font-bold uppercase text-sm hover:bg-white transition-colors"
        >
          <svg
            className="w-5 h-5 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download QR Code
        </button>
      )}
    </div>
  );
}
