"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  enabled: boolean;
}

export default function QRScanner({ onScan, enabled }: QRScannerProps) {
  const scannerRef = useRef<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;
    setError(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScanRef.current(decodedText);
        },
        () => {} // ignore no-QR frames
      );
      setIsScanning(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied";
      setError(msg);
      setIsScanning(false);
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (scannerRef.current as any).stop();
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [enabled, startScanner, stopScanner]);

  return (
    <div>
      <div
        id="qr-reader"
        style={{ width: "100%" }}
        className="rounded-lg overflow-hidden"
      />
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      {enabled && isScanning && (
        <p className="text-green-600 text-xs mt-2 text-center">Camera active - point at QR code</p>
      )}
      {enabled && !isScanning && !error && (
        <p className="text-gray-400 text-xs mt-2 text-center">Starting camera...</p>
      )}
    </div>
  );
}
