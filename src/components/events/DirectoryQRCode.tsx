"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";

interface DirectoryQRCodeProps {
  eventId: string;
  eventName: string;
}

export default function DirectoryQRCode({ eventId, eventName }: DirectoryQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const directoryUrl = typeof window !== "undefined"
    ? `${window.location.origin}/directory/${eventId}`
    : `/directory/${eventId}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(directoryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadQR() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    // Convert embedded logo to data URL so it survives SVG serialization
    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute("width", "400");
    clonedSvg.setAttribute("height", "400");

    // Replace relative image hrefs with data URLs
    const images = clonedSvg.querySelectorAll("image");
    for (const image of images) {
      const href = image.getAttribute("href") || image.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      if (href && !href.startsWith("data:")) {
        try {
          const resp = await fetch(href);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          image.setAttribute("href", dataUrl);
        } catch { /* skip if fetch fails */ }
      }
    }

    // Add white background
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", "white");
    clonedSvg.insertBefore(rect, clonedSvg.firstChild);

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);
      }
      const link = document.createElement("a");
      link.download = `QR - ${eventName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-6">
      <div ref={qrRef} className="shrink-0 p-3 bg-white rounded-xl border-2 border-gray-100">
        <QRCodeSVG
          value={directoryUrl}
          size={100}
          bgColor="transparent"
          fgColor="#223167"
          level="M"
          imageSettings={{
            src: "/logo-icon.png",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#2d3e50] mb-1">Guest Directory QR Code</h3>
        <p className="text-xs text-gray-500 mb-3">
          Share this QR code with attendees to access the public guest directory
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-gray-50 px-3 py-2 rounded-lg text-gray-600 truncate border border-gray-100">
            {directoryUrl}
          </code>
          <button
            onClick={handleCopyLink}
            className="shrink-0 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-[#2d3e50] hover:bg-gray-50 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownloadQR}
            className="shrink-0 px-3 py-2 text-xs font-medium rounded-lg text-white transition-colors"
            style={{ backgroundColor: "#223167" }}
          >
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
