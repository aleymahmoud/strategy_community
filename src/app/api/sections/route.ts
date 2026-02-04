import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Venue elements that don't have seats
const VENUE_ELEMENTS = ["STAGE", "SCREEN", "CATERING", "SOUND_SYSTEM", "PHOTO_SPOT"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { layoutId, name, type, capacity, positionX, positionY, width, height } = body;

    if (!layoutId || !name) {
      return NextResponse.json(
        { message: "Layout ID and name are required" },
        { status: 400 }
      );
    }

    // Determine if this is a venue element (no seats) or seating element
    const isVenueElement = VENUE_ELEMENTS.includes(type);
    const sectionCapacity = isVenueElement ? 0 : (capacity ?? 8);

    // Create section - only create seats for seating elements
    const section = await prisma.section.create({
      data: {
        layoutId,
        name: name.trim(),
        type: type || "ROUND_TABLE",
        capacity: sectionCapacity,
        positionX: positionX ?? 0,
        positionY: positionY ?? 0,
        width: width ?? 100,
        height: height ?? 100,
        rotation: 0,
        ...(sectionCapacity > 0 && {
          seats: {
            create: Array.from({ length: sectionCapacity }).map((_, i) => ({
              label: `${name.trim()}-${i + 1}`,
              positionX: 0,
              positionY: 0,
              status: "AVAILABLE",
            })),
          },
        }),
      },
      include: {
        seats: true,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Failed to create section:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to create section", error: errorMessage },
      { status: 500 }
    );
  }
}
