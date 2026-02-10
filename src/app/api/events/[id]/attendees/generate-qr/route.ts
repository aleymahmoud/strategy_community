import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find all confirmed/attended attendees without a QR code
    const attendees = await prisma.eventAttendee.findMany({
      where: {
        eventId: id,
        qrCode: null,
        status: { in: ["CONFIRMED", "ATTENDED"] },
      },
    });

    if (attendees.length === 0) {
      return NextResponse.json({
        message: "All confirmed attendees already have QR codes",
        updated: 0,
      });
    }

    // Generate QR code value = attendeeId for each
    await prisma.$transaction(
      attendees.map((a) =>
        prisma.eventAttendee.update({
          where: { id: a.id },
          data: { qrCode: a.id },
        })
      )
    );

    // Return updated attendees
    const updated = await prisma.eventAttendee.findMany({
      where: { eventId: id },
      include: { member: true, seat: true },
    });

    return NextResponse.json({ updated: attendees.length, attendees: updated });
  } catch (error) {
    console.error("Failed to generate QR codes:", error);
    return NextResponse.json(
      { message: "Failed to generate QR codes" },
      { status: 500 }
    );
  }
}
