import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Clear all QR codes for this event
    await prisma.eventAttendee.updateMany({
      where: { eventId: id },
      data: { qrCode: null },
    });

    // Reset ATTENDED back to CONFIRMED
    await prisma.eventAttendee.updateMany({
      where: { eventId: id, status: "ATTENDED" },
      data: { status: "CONFIRMED" },
    });

    return NextResponse.json({ message: "Attendance reset" });
  } catch (error) {
    console.error("Failed to reset attendance:", error);
    return NextResponse.json(
      { message: "Failed to reset attendance" },
      { status: 500 }
    );
  }
}
