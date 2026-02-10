import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// GET: Download Excel template with confirmed attendees
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const attendees = await prisma.eventAttendee.findMany({
      where: {
        eventId: id,
        status: { in: ["CONFIRMED", "ATTENDED"] },
      },
      include: { member: true },
      orderBy: { member: { name: "asc" } },
    });

    const rows = attendees.map((a) => ({
      "Attendee ID": a.id,
      "Member Name": a.member.name,
      Status: a.status,
      "Current QR Code": a.qrCode || "",
      "New QR Code (fill in)": "",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    ws["!cols"] = [
      { wch: 28 }, // Attendee ID
      { wch: 30 }, // Member Name
      { wch: 12 }, // Status
      { wch: 30 }, // Current QR Code
      { wch: 30 }, // New QR Code
    ];

    XLSX.utils.book_append_sheet(wb, ws, "QR Codes");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="qr-template-${id}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate QR template:", error);
    return NextResponse.json(
      { message: "Failed to generate template" },
      { status: 500 }
    );
  }
}

// POST: Upload Excel with QR codes
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

    let updatedCount = 0;

    for (const row of rows) {
      const attendeeId = row["Attendee ID"];
      const newQrCode = row["New QR Code (fill in)"];

      if (!attendeeId || !newQrCode) continue;

      // Verify the attendee belongs to this event
      const attendee = await prisma.eventAttendee.findFirst({
        where: { id: attendeeId, eventId: id },
      });

      if (attendee) {
        await prisma.eventAttendee.update({
          where: { id: attendeeId },
          data: { qrCode: newQrCode },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      message: `Updated ${updatedCount} QR codes`,
      updated: updatedCount,
    });
  } catch (error) {
    console.error("Failed to upload QR template:", error);
    return NextResponse.json(
      { message: "Failed to process uploaded file" },
      { status: 500 }
    );
  }
}
