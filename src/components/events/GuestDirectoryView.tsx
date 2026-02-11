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

interface SeatingTable {
  name: string;
  members: string[];
}

interface GuestDirectoryViewProps {
  eventName: string;
  eventDate: string;
  guests: Guest[];
  seatingTables?: SeatingTable[];
}

const GUESTS_PER_PAGE = 12;
const NAVY = "#223167";
const GOLD = "#f5ae27";

const TABLES_PER_PAGE = 4;

export default function GuestDirectoryView({ eventName, eventDate, guests, seatingTables = [] }: GuestDirectoryViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [mobileTab, setMobileTab] = useState<"guests" | "seating">("guests");
  const [searchQuery, setSearchQuery] = useState("");

  // Split guests into pages
  const guestPages: Guest[][] = [];
  for (let i = 0; i < guests.length; i += GUESTS_PER_PAGE) {
    guestPages.push(guests.slice(i, i + GUESTS_PER_PAGE));
  }

  // Split seating tables into pages of 4
  const seatingPages: SeatingTable[][] = [];
  for (let i = 0; i < seatingTables.length; i += TABLES_PER_PAGE) {
    seatingPages.push(seatingTables.slice(i, i + TABLES_PER_PAGE));
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

      {/* Mobile View */}
      <div className="lg:hidden print:hidden px-4 py-4" style={{ fontFamily: "'Kohinoor Bangla', system-ui, sans-serif" }}>
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMobileTab("guests")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              mobileTab === "guests"
                ? "text-white"
                : "bg-gray-100 text-gray-600"
            }`}
            style={mobileTab === "guests" ? { backgroundColor: NAVY } : undefined}
          >
            Guests ({guests.length})
          </button>
          {seatingTables.length > 0 && (
            <button
              onClick={() => setMobileTab("seating")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                mobileTab === "seating"
                  ? "text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              style={mobileTab === "seating" ? { backgroundColor: NAVY } : undefined}
            >
              Seating ({seatingTables.length})
            </button>
          )}
        </div>

        {/* Guest Cards */}
        {mobileTab === "guests" && (
          <div className="space-y-2">
            {guests
              .filter((g) =>
                searchQuery
                  ? g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    g.company.toLowerCase().includes(searchQuery.toLowerCase())
                  : true
              )
              .map((guest) => (
                <div key={guest.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <div
                    className="flex-shrink-0 overflow-hidden"
                    style={{ width: 48, height: 48, borderRadius: "14px 0 0 0" }}
                  >
                    {guest.photo ? (
                      <img src={guest.photo} alt={guest.name} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-gray-100 to-gray-200"
                        style={{ color: NAVY }}
                      >
                        {guest.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: NAVY }}>{guest.name}</p>
                    {guest.title && <p className="text-xs text-gray-500 truncate">{guest.title}</p>}
                    {guest.company && <p className="text-xs font-medium truncate" style={{ color: GOLD }}>{guest.company}</p>}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Seating Tables */}
        {mobileTab === "seating" && (
          <div className="space-y-3">
            {seatingTables.map((table, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-2.5" style={{ backgroundColor: NAVY }}>
                  <h3 className="text-sm font-bold" style={{ color: GOLD }}>{table.name}</h3>
                </div>
                <div className="px-4 py-2">
                  {table.members.map((member, mIdx) => (
                    <p key={mIdx} className="text-sm py-1 border-b border-gray-50 last:border-0" style={{ color: NAVY }}>
                      {member}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Content (Desktop + Print) */}
      <div ref={printRef} className="hidden lg:block print:!block max-w-5xl mx-auto py-8 print:p-0 print:max-w-none" style={{ fontFamily: "'Kohinoor Bangla', system-ui, sans-serif" }}>
        {/* === COVER PAGE === */}
        <div
          data-pdf-page
          className="relative bg-white mx-auto mb-8 print:mb-0 print:break-after-page shadow-lg print:shadow-none"
          style={{ width: "210mm", height: "297mm", overflow: "hidden" }}
        >
          {/* White background */}
          <div className="absolute inset-0 bg-white" />

          {/* Watermark - compass icon, centered */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.06 }}>
            <img src="/logo-icon.png" alt="" style={{ width: "550px", height: "auto", filter: "grayscale(100%)" }} />
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
              <span className="block text-[90px] font-extrabold leading-none" style={{ color: NAVY, letterSpacing: "5px" }}>
                GUEST
              </span>
              <span className="block text-[72px] font-extrabold leading-none mt-1" style={{ color: GOLD, letterSpacing: "3.6px" }}>
                DIRECTORY
              </span>
            </h1>
          </div>

          {/* Bottom-left logo */}
          <div className="absolute" style={{ bottom: "20mm", left: "16mm" }}>
            <img src="/logo.png" alt="The Strategy Community" style={{ width: "200px", height: "auto" }} />
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

            {/* Watermark - compass icon, centered */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.06 }}>
              <img src="/logo-icon.png" alt="" style={{ width: "550px", height: "auto", filter: "grayscale(100%)" }} />
            </div>

            {/* Header */}
            <div className="relative px-12 pt-8 pb-4">
              <h2 className="text-[36px] font-bold leading-none">
                <span style={{ color: NAVY }}>GUEST </span>
                <span style={{ color: GOLD }}>LIST</span>
              </h2>
            </div>

            {/* Gold divider line */}
            <div className="mx-12 h-[2px]" style={{ backgroundColor: GOLD }} />

            {/* Guest Grid - 2 columns x 5 rows, spread to fill page */}
            <div className="relative px-12 flex flex-col justify-between gap-y-16" style={{ height: "calc(297mm - 80mm - 40mm)", paddingTop: "16px", paddingBottom: "4px" }}>
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

        {/* === SEATING PLAN PAGES === */}
        {seatingPages.map((pageTables, pageIdx) => (
          <div
            key={`seating-${pageIdx}`}
            data-pdf-page
            className="relative bg-white mx-auto mb-8 print:mb-0 print:break-after-page shadow-lg print:shadow-none"
            style={{ width: "210mm", height: "297mm", overflow: "hidden" }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-white" />

            {/* Watermark - compass icon, centered */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.06 }}>
              <img src="/logo-icon.png" alt="" style={{ width: "550px", height: "auto", filter: "grayscale(100%)" }} />
            </div>

            {/* Header */}
            <div className="relative px-12 pt-8 pb-4">
              <h2 className="text-[36px] font-bold leading-none">
                <span style={{ color: NAVY }}>SEATING </span>
                <span style={{ color: GOLD }}>PLAN</span>
              </h2>
            </div>

            {/* Gold divider line */}
            <div className="mx-12 h-[2px]" style={{ backgroundColor: GOLD }} />

            {/* Tables grid - 4 tables filling available space */}
            <div className="relative px-12 grid grid-cols-2 gap-x-8 gap-y-4" style={{ height: "calc(297mm - 55mm - 22mm)", paddingTop: "12px", paddingBottom: "4px" }}>
              {pageTables.map((table, tableIdx) => (
                <div
                  key={tableIdx}
                  className="flex flex-col overflow-hidden"
                  style={{ height: "300px" }}
                >
                  {/* Table header */}
                  <div
                    className="px-4 py-2 flex-shrink-0"
                    style={{ backgroundColor: NAVY, borderRadius: "6px 6px 0 0" }}
                  >
                    <h3 className="text-[24px] font-bold tracking-wide" style={{ color: GOLD }}>
                      {table.name}
                    </h3>
                  </div>
                  {/* Table members */}
                  <div
                    className="flex-1 px-4 py-2 border border-t-0"
                    style={{ borderColor: "#e5e7eb", borderRadius: "0 0 6px 6px" }}
                  >
                    {table.members.map((member, mIdx) => (
                      <p
                        key={mIdx}
                        className="text-[18px] leading-relaxed font-medium"
                        style={{ color: NAVY }}
                      >
                        {member}
                      </p>
                    ))}
                  </div>
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

        {/* === CLOSING PAGE (Back Cover Image) === */}
        <div
          data-pdf-page
          className="relative mx-auto mb-8 print:mb-0 shadow-lg print:shadow-none"
          style={{ width: "210mm", height: "297mm", overflow: "hidden" }}
        >
          <img src="/BACKCOVER.jpg" alt="Back Cover" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
