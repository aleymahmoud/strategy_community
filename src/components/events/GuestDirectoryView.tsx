"use client";

import { useRef, useState } from "react";
import Link from "next/link";

interface Guest {
  id: string;
  name: string;
  title: string;
  company: string;
  photo: string | null;
}

interface GuestDirectoryViewProps {
  eventName: string;
  eventDate: string;
  guests: Guest[];
}

const GUESTS_PER_PAGE = 8;
const NAVY = "#223167";
const GOLD = "#f5ae27";

export default function GuestDirectoryView({ eventName, eventDate, guests }: GuestDirectoryViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Split guests into pages of 8
  const guestPages: Guest[][] = [];
  for (let i = 0; i < guests.length; i += GUESTS_PER_PAGE) {
    guestPages.push(guests.slice(i, i + GUESTS_PER_PAGE));
  }

  async function handleDownloadPDF() {
    if (!printRef.current) return;
    setDownloading(true);

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const pages = printRef.current.querySelectorAll("[data-pdf-page]");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`Guest Directory - ${eventName}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold" style={{ color: NAVY }}>Guest Directory</h1>
              <p className="text-sm text-gray-500">{eventName} - {guests.length} guests</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors flex items-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: NAVY }}
            >
              {downloading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div ref={printRef} className="max-w-5xl mx-auto py-8 print:p-0 print:max-w-none" style={{ fontFamily: "'Kohinoor Bangla', system-ui, sans-serif" }}>
        {/* === COVER PAGE === */}
        <div
          data-pdf-page
          className="relative bg-white mx-auto mb-8 print:mb-0 print:break-after-page shadow-lg print:shadow-none"
          style={{ width: "210mm", height: "297mm", overflow: "hidden" }}
        >
          {/* White background */}
          <div className="absolute inset-0 bg-white" />

          {/* Large faded S logo watermark in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]">
            <img src="/logo-icon.png" alt="" className="w-[420px] h-auto" style={{ filter: "grayscale(100%)" }} />
          </div>

          {/* Top-right event name with corner bracket */}
          <div className="absolute top-12 right-12 text-right">
            <div className="inline-block relative pb-2 pr-4">
              {/* Corner bracket - bottom-right */}
              <div
                className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px]"
                style={{ borderColor: NAVY }}
              />
              <p className="text-[22px] font-bold tracking-tight">
                {eventName.toUpperCase().split(/(\d+)/).map((part, i) =>
                  /\d+/.test(part)
                    ? <span key={i} style={{ color: GOLD }}>{part}</span>
                    : <span key={i} style={{ color: NAVY }}>{part}</span>
                )}
              </p>
            </div>
          </div>

          {/* Title - left aligned, vertically centered */}
          <div className="relative h-full flex flex-col justify-center px-16">
            <h1>
              <span className="block text-[72px] font-extrabold leading-none tracking-tight" style={{ color: NAVY }}>
                GUEST
              </span>
              <span className="block text-[60px] font-extrabold leading-none tracking-tight mt-1" style={{ color: GOLD }}>
                DIRECTORY
              </span>
            </h1>
          </div>

          {/* Bottom-left logo */}
          <div className="absolute bottom-12 left-16">
            <img src="/logo.png" alt="The Strategy Community" className="h-20 w-auto" />
          </div>
        </div>

        {/* === GUEST LIST PAGES === */}
        {guestPages.map((pageGuests, pageIndex) => (
          <div
            key={pageIndex}
            data-pdf-page
            className="relative bg-white mx-auto mb-8 print:mb-0 print:break-after-page shadow-lg print:shadow-none"
            style={{ width: "210mm", height: "297mm", overflow: "hidden" }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-white" />

            {/* Header */}
            <div className="relative px-12 pt-8 pb-4">
              <h2 className="text-[36px] font-bold leading-none">
                <span style={{ color: NAVY }}>GUEST </span>
                <span style={{ color: GOLD }}>LIST</span>
              </h2>
            </div>

            {/* Gold divider line */}
            <div className="mx-12 h-[2px]" style={{ backgroundColor: GOLD }} />

            {/* Guest Grid - 2 columns x 4 rows, spread to fill page */}
            <div className="relative px-12 flex flex-col justify-between" style={{ height: "calc(297mm - 80mm - 50mm)", paddingTop: "20px", paddingBottom: "8px" }}>
              {/* Split guests into rows of 2 */}
              {Array.from({ length: Math.ceil(pageGuests.length / 2) }, (_, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-2 gap-x-10">
                  {pageGuests.slice(rowIdx * 2, rowIdx * 2 + 2).map((guest) => (
                    <div key={guest.id} className="flex items-start gap-5">
                      {/* Photo - Arch frame */}
                      <div
                        className="flex-shrink-0 overflow-hidden border-2 border-gray-200"
                        style={{
                          width: 78,
                          height: 100,
                          borderRadius: "30px 0 0 0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {guest.photo ? (
                          <img src={guest.photo} alt={guest.name} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-gray-100 to-gray-200"
                            style={{ color: NAVY }}
                          >
                            {guest.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 pt-1">
                        <h3
                          className="text-[14px] font-bold leading-snug truncate"
                          style={{ color: GOLD }}
                        >
                          {guest.name}
                        </h3>
                        {guest.title && (
                          <p
                            className="text-[14px] font-bold leading-snug mt-1"
                            style={{ color: NAVY }}
                          >
                            {guest.title}
                          </p>
                        )}
                        {guest.company && (
                          <p
                            className="text-[14px] font-bold leading-snug"
                            style={{ color: NAVY }}
                          >
                            {guest.company}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="px-12 pb-6 flex items-center justify-between">
                <p className="text-[10px] tracking-[0.12em] uppercase font-extrabold" style={{ color: GOLD }}>
                  This is an exclusive event and attendance requires an invitation
                </p>
                <img src="/logo-icon.png" alt="" className="h-10 w-auto" />
              </div>
            </div>
          </div>
        ))}

        {/* === CLOSING PAGE === */}
        <div
          data-pdf-page
          className="relative bg-white mx-auto mb-8 print:mb-0 shadow-lg print:shadow-none"
          style={{ width: "210mm", height: "297mm", overflow: "hidden" }}
        >
          {/* Navy top section ~80% */}
          <div className="absolute top-0 left-0 right-0" style={{ height: "80%", backgroundColor: NAVY }}>
            {/* Large faded logo watermark - right side */}
            <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-[0.12]">
              <img src="/logo-icon.png" alt="" className="w-[380px] h-auto" style={{ filter: "grayscale(100%)" }} />
            </div>

            {/* Text - left aligned */}
            <div className="relative h-full flex flex-col justify-center px-16">
              <h2 className="text-[52px] font-extrabold leading-[1.1]" style={{ color: "white" }}>
                LOOKING
              </h2>
              <h2 className="text-[52px] font-extrabold leading-[1.1]" style={{ color: "white" }}>
                FORWARD
              </h2>
              <h2 className="text-[64px] font-extrabold leading-[1.1] mt-2" style={{ color: GOLD }}>
                TO
              </h2>
              <h2 className="text-[64px] font-extrabold leading-[1.1]" style={{ color: GOLD }}>
                SEE
              </h2>
              <h2 className="text-[64px] font-extrabold leading-[1.1]" style={{ color: GOLD }}>
                YOU!
              </h2>
            </div>

            {/* Gold corner bracket - bottom right of navy section */}
            <div className="absolute bottom-6 right-8 w-8 h-8 border-b-[4px] border-r-[4px]" style={{ borderColor: GOLD }} />
          </div>

          {/* White bottom section ~20% */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center px-16" style={{ height: "20%", backgroundColor: "white" }}>
            <div className="relative">
              {/* Navy corner bracket - top right of logo area */}
              <div className="absolute -top-3 -right-4 w-5 h-5 border-t-[3px] border-r-[3px]" style={{ borderColor: NAVY }} />
              <img src="/logo.png" alt="The Strategy Community" className="w-auto" style={{ height: "30mm" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
