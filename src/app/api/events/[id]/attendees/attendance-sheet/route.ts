import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// GET: Download attendance sheet with current statuses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      select: { name: true, date: true, location: true },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const attendees = await prisma.eventAttendee.findMany({
      where: { eventId: id },
      include: { member: true },
      orderBy: { member: { name: "asc" } },
    });

    const rows = attendees.map((a) => ({
      "Name": a.member.name,
      "Email": a.member.email || "",
      "Phone": a.member.phone || "",
      "Membership": a.member.membership || "",
      "Status": a.status,
      "Company": a.member.company || "",
      "Title": a.member.title || "",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    ws["!cols"] = [
      { wch: 30 }, // Name
      { wch: 30 }, // Email
      { wch: 18 }, // Phone
      { wch: 16 }, // Membership
      { wch: 14 }, // Status
      { wch: 30 }, // Company
      { wch: 30 }, // Title
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const safeName = event.name.replace(/[^a-zA-Z0-9 ]/g, "").trim();

    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Attendance - ${safeName}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate attendance sheet:", error);
    return NextResponse.json(
      { message: "Failed to generate attendance sheet" },
      { status: 500 }
    );
  }
}
