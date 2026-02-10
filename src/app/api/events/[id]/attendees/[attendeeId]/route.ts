import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attendeeId: string }> }
) {
  try {
    const { attendeeId } = await params;
    const body = await request.json();
    const { seatId, status, whatsapp, followUp, introCall, comments, qrCode, qrImageUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (seatId !== undefined) updateData.seatId = seatId;
    if (status !== undefined) updateData.status = status;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (followUp !== undefined) updateData.followUp = followUp;
    if (introCall !== undefined) updateData.introCall = introCall;
    if (comments !== undefined) updateData.comments = comments;
    if (qrCode !== undefined) updateData.qrCode = qrCode;
    if (qrImageUrl !== undefined) updateData.qrImageUrl = qrImageUrl;

    const attendee = await prisma.eventAttendee.update({
      where: { id: attendeeId },
      data: updateData,
      include: {
        member: true,
        seat: true,
      },
    });

    return NextResponse.json(attendee);
  } catch (error) {
    console.error("Failed to update attendee:", error);
    return NextResponse.json(
      { message: "Failed to update attendee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attendeeId: string }> }
) {
  try {
    const { attendeeId } = await params;
    await prisma.eventAttendee.delete({
      where: { id: attendeeId },
    });

    return NextResponse.json({ message: "Attendee removed" });
  } catch (error) {
    console.error("Failed to remove attendee:", error);
    return NextResponse.json(
      { message: "Failed to remove attendee" },
      { status: 500 }
    );
  }
}
