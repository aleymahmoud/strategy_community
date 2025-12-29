import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attendees = await prisma.eventAttendee.findMany({
      where: { eventId: id },
      include: {
        member: true,
        seat: true,
      },
    });

    return NextResponse.json(attendees);
  } catch (error) {
    console.error("Failed to fetch attendees:", error);
    return NextResponse.json(
      { message: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, status } = body;

    if (!memberId) {
      return NextResponse.json(
        { message: "Member ID is required" },
        { status: 400 }
      );
    }

    // Check if member is already an attendee
    const existing = await prisma.eventAttendee.findFirst({
      where: {
        eventId: id,
        memberId: memberId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Member is already an attendee" },
        { status: 400 }
      );
    }

    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId: id,
        memberId: memberId,
        status: status || "INVITED",
      },
      include: {
        member: true,
        seat: true,
      },
    });

    return NextResponse.json(attendee, { status: 201 });
  } catch (error) {
    console.error("Failed to add attendee:", error);
    return NextResponse.json(
      { message: "Failed to add attendee" },
      { status: 500 }
    );
  }
}
