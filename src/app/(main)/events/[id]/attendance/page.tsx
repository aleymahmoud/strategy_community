"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { statusColors } from "@/lib/constants";
import QRScanner from "@/components/events/QRScanner";

interface Attendee {
  id: string;
  memberId: string;
  status: string;
  qrCode: string | null;
  member: {
    id: string;
    name: string;
    membership: string | null;
  };
}

interface EventData {
  id: string;
  name: string;
  attendees: Attendee[];
}

interface ScanEntry {
  name: string;
  time: string;
}

export default function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingQR, setEditingQR] = useState<string | null>(null);
  const [qrInput, setQrInput] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [recentScans, setRecentScans] = useState<ScanEntry[]>([]);
  const lastScanRef = useRef<{ value: string; time: number }>({
    value: "",
    time: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchEvent() {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Event not found");
      const data = await res.json();
      // Only show confirmed/attended/absent attendees
      data.attendees = data.attendees.filter(
        (a: Attendee) =>
          a.status === "CONFIRMED" ||
          a.status === "ATTENDED" ||
          a.status === "ABSENT"
      );
      setEvent(data);
    } catch (error) {
      console.error("Failed to fetch event:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateQR() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/events/${id}/attendees/generate-qr`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (event) {
          // Refresh attendee data
          const filtered = data.attendees.filter(
            (a: Attendee) =>
              a.status === "CONFIRMED" ||
              a.status === "ATTENDED" ||
              a.status === "ABSENT"
          );
          setEvent({ ...event, attendees: filtered });
        }
      }
    } catch (error) {
      console.error("Failed to generate QR codes:", error);
    } finally {
      setGenerating(false);
    }
  }

  async function handleResetMember(attendeeId: string) {
    try {
      const res = await fetch(`/api/events/${id}/attendees/${attendeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: null, status: "CONFIRMED" }),
      });
      if (res.ok) {
        setEvent((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            attendees: prev.attendees.map((a) =>
              a.id === attendeeId ? { ...a, qrCode: null, status: "CONFIRMED" } : a
            ),
          };
        });
      }
    } catch (error) {
      console.error("Failed to reset member:", error);
    }
  }

  async function handleSaveQR(attendeeId: string) {
    if (!qrInput.trim()) return;
    try {
      const res = await fetch(`/api/events/${id}/attendees/${attendeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qrInput.trim() }),
      });
      if (res.ok) {
        setEvent((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            attendees: prev.attendees.map((a) =>
              a.id === attendeeId ? { ...a, qrCode: qrInput.trim() } : a
            ),
          };
        });
      }
    } catch (error) {
      console.error("Failed to save QR code:", error);
    } finally {
      setEditingQR(null);
      setQrInput("");
    }
  }

  async function handleDownloadTemplate() {
    window.open(`/api/events/${id}/attendees/qr-template`, "_blank");
  }

  async function handleUploadTemplate(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/events/${id}/attendees/qr-template`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchEvent(); // Refresh data
      }
    } catch (error) {
      console.error("Failed to upload template:", error);
    } finally {
      setUploading(false);
    }
  }

  async function downloadQRCode(attendee: Attendee) {
    // If it's a URL image, open it directly
    if (attendee.qrCode?.startsWith("http")) {
      window.open(attendee.qrCode, "_blank");
      return;
    }

    const svgEl = document.querySelector(
      `[data-qr-attendee="${attendee.id}"] svg`
    );
    if (!svgEl) return;

    const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute("width", "400");
    clonedSvg.setAttribute("height", "400");

    // Convert embedded logo to data URL so it survives SVG serialization
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

    const rect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
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
      link.download = `QR - ${attendee.member.name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  }

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (!event) return;

      // Debounce: ignore same QR within 3 seconds
      const now = Date.now();
      if (
        decodedText === lastScanRef.current.value &&
        now - lastScanRef.current.time < 3000
      ) {
        return;
      }
      lastScanRef.current = { value: decodedText, time: now };

      // Find matching attendee by qrCode or by attendee ID
      const attendee = event.attendees.find(
        (a) => a.qrCode === decodedText || a.id === decodedText
      );

      if (!attendee) {
        setScanFeedback({
          type: "error",
          message: "Unknown QR code - no matching attendee",
        });
        setTimeout(() => setScanFeedback(null), 3000);
        return;
      }

      if (attendee.status === "ATTENDED") {
        setScanFeedback({
          type: "success",
          message: `${attendee.member.name} already checked in`,
        });
        setTimeout(() => setScanFeedback(null), 3000);
        return;
      }

      // Mark as attended
      try {
        const res = await fetch(
          `/api/events/${id}/attendees/${attendee.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ATTENDED" }),
          }
        );

        if (res.ok) {
          setEvent((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              attendees: prev.attendees.map((a) =>
                a.id === attendee.id ? { ...a, status: "ATTENDED" } : a
              ),
            };
          });

          const timeStr = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Africa/Cairo",
          });

          setRecentScans((prev) => [
            { name: attendee.member.name, time: timeStr },
            ...prev.slice(0, 19),
          ]);

          setScanFeedback({
            type: "success",
            message: `${attendee.member.name} checked in!`,
          });
          setTimeout(() => setScanFeedback(null), 3000);
        }
      } catch (error) {
        console.error("Failed to update attendance:", error);
        setScanFeedback({
          type: "error",
          message: "Failed to update - try again",
        });
        setTimeout(() => setScanFeedback(null), 3000);
      }
    },
    [event, id]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Event not found</p>
        <Link href="/events" className="text-blue-500 hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  const attendedCount = event.attendees.filter(
    (a) => a.status === "ATTENDED"
  ).length;
  const withQR = event.attendees.filter((a) => a.qrCode).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/events/${id}`}
            className="text-gray-400 hover:text-[#2d3e50] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-[#2d3e50]">
            Attendance: {event.name}
          </h1>
        </div>
        <div className="text-sm text-gray-600">
          {attendedCount}/{event.attendees.length} checked in
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Member List with QR */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Actions Bar */}
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/30 flex flex-wrap gap-2">
            <button
              onClick={handleGenerateQR}
              disabled={generating}
              className="px-4 py-2 bg-[#2d3e50] text-white rounded-lg text-sm font-medium hover:bg-[#3d5068] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {generating ? "Generating..." : "Generate QR Codes"}
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#2d3e50] hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Template
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#2d3e50] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {uploading ? "Uploading..." : "Upload Template"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadTemplate(file);
                e.target.value = "";
              }}
            />
            <span className="text-xs text-gray-400 self-center ml-2">
              {withQR}/{event.attendees.length} have QR codes
            </span>
          </div>

          {/* Members Table */}
          {event.attendees.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No confirmed attendees yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {event.attendees.map((attendee) => (
                    <tr
                      key={attendee.id}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        attendee.status === "ATTENDED"
                          ? "bg-green-50/30"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/members/${attendee.member.id}`}
                          className="text-[#2d3e50] font-medium hover:text-[#d4a537] transition-colors text-sm"
                        >
                          {attendee.member.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            statusColors[attendee.status] || "bg-gray-100"
                          }`}
                        >
                          {attendee.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {attendee.qrCode ? (
                          attendee.qrCode.startsWith("http") ? (
                            <img
                              src={attendee.qrCode}
                              alt={`QR - ${attendee.member.name}`}
                              className="w-14 h-14 object-contain inline-block rounded"
                            />
                          ) : (
                            <div
                              data-qr-attendee={attendee.id}
                              className="inline-block"
                            >
                              <QRCodeSVG
                                value={attendee.qrCode}
                                size={56}
                                fgColor="#223167"
                                level="M"
                                imageSettings={{
                                  src: "/logo-icon.png",
                                  x: undefined,
                                  y: undefined,
                                  height: 14,
                                  width: 14,
                                  excavate: true,
                                }}
                              />
                            </div>
                          )
                        ) : editingQR === attendee.id ? (
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              type="text"
                              value={qrInput}
                              onChange={(e) => setQrInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveQR(attendee.id);
                                if (e.key === "Escape") { setEditingQR(null); setQrInput(""); }
                              }}
                              placeholder="QR value or URL"
                              className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#d4a537]"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveQR(attendee.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Save"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => { setEditingQR(null); setQrInput(""); }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Cancel"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingQR(attendee.id); setQrInput(""); }}
                            className="text-xs text-gray-400 hover:text-[#d4a537] transition-colors cursor-pointer"
                            title="Click to add QR code manually"
                          >
                            No QR <span className="text-[10px]">+ Add</span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {attendee.qrCode && (
                            <>
                              <button
                                onClick={() => downloadQRCode(attendee)}
                                className="text-[#d4a537] hover:text-[#b8912e] transition-colors"
                                title="Download QR"
                              >
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleResetMember(attendee.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                                title="Reset QR & status"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel - QR Scanner */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-[#2d3e50]">
            <h3 className="text-white font-semibold text-sm">QR Scanner</h3>
            <p className="text-white/60 text-xs mt-0.5">
              Scan member QR codes to check in
            </p>
          </div>

          <div className="p-4">
            {/* Start/Stop Button */}
            <button
              onClick={() => setScannerEnabled(!scannerEnabled)}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-4 flex items-center justify-center gap-2 ${
                scannerEnabled
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {scannerEnabled ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                  Stop Scanner
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Start Scanner
                </>
              )}
            </button>

            {/* Scanner Area */}
            <QRScanner onScan={handleScan} enabled={scannerEnabled} />

            {/* Scan Feedback */}
            {scanFeedback && (
              <div
                className={`mt-3 px-4 py-3 rounded-lg text-sm font-medium text-center transition-all ${
                  scanFeedback.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {scanFeedback.message}
              </div>
            )}
          </div>

          {/* Recent Scans */}
          {recentScans.length > 0 && (
            <div className="border-t border-gray-100 p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Recent Check-ins
              </h4>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {recentScans.map((scan, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm"
                  >
                    <svg
                      className="w-4 h-4 text-green-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 truncate">
                      {scan.name}
                    </span>
                    <span className="text-gray-400 text-xs ml-auto flex-shrink-0">
                      {scan.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
