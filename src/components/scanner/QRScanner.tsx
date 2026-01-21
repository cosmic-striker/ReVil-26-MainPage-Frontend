"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  isActive?: boolean;
}

export default function QRScanner({
  onScan,
  onError,
  isActive = true,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  const startScanner = useCallback(async () => {
    if (!containerRef.current || scannerRef.current) return;

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      };

      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ignore continuous scan errors
          if (errorMessage.includes("No QR code found")) return;
          console.log("QR Scan Error:", errorMessage);
        }
      );

      if (mountedRef.current) {
        setIsScanning(true);
        setHasPermission(true);
        setErrorMessage("");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Scanner start error:", error);

      if (mountedRef.current) {
        setHasPermission(false);

        if (error.message.includes("Permission denied")) {
          setErrorMessage(
            "Camera permission denied. Please allow camera access to scan QR codes."
          );
        } else if (error.message.includes("NotFoundError")) {
          setErrorMessage("No camera found. Please connect a camera device.");
        } else {
          setErrorMessage(`Failed to start scanner: ${error.message}`);
        }
      }

      onError?.(error.message);
    }
  }, [onScan, onError]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
      if (mountedRef.current) {
        setIsScanning(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      if (isActive && mountedRef.current) {
        startScanner();
      } else {
        stopScanner();
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      stopScanner();
    };
  }, [isActive, startScanner, stopScanner]);

  const handleRetry = () => {
    setErrorMessage("");
    setHasPermission(null);
    startScanner();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Scanner Container */}
      <div
        ref={containerRef}
        className="relative bg-black/50 rounded-2xl overflow-hidden border-2 border-primary/30"
      >
        {/* QR Reader Element */}
        <div
          id="qr-reader"
          className="w-full aspect-square"
          style={{ minHeight: "300px" }}
        />

        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner Markers */}
            <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-lg" />

            {/* Scanning Line Animation */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[250px] h-[250px]">
              <div className="absolute inset-0 border-2 border-primary/30 rounded-lg" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
            </div>
          </div>
        )}

        {/* Permission Error State */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-white text-sm mb-4">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {hasPermission === null && !isScanning && !errorMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-primary font-mono text-sm">
                Initializing camera...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isScanning ? "bg-green-500 animate-pulse" : "bg-gray-500"
          }`}
        />
        <span className="text-sm text-gray-400 font-mono">
          {isScanning ? "Scanner Active" : "Scanner Inactive"}
        </span>
      </div>

      {/* Instructions */}
      <p className="text-center text-gray-400 text-sm mt-4 font-mono">
        Position the QR code within the frame to scan
      </p>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            top: 0;
          }
          50% {
            top: calc(100% - 2px);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
