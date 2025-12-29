import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Create section with seats
    const section = await prisma.section.create({
      data: {
        layoutId,
        name: name.trim(),
        type: type || "ROUND_TABLE",
        capacity: capacity || 8,
        positionX: positionX || 0,
        positionY: positionY || 0,
        width: width || 100,
        height: height || 100,
        rotation: 0,
        seats: {
          create: Array.from({ length: capacity || 8 }).map((_, i) => ({
            label: `${name.trim()}-${i + 1}`,
            positionX: 0,
            positionY: 0,
            status: "AVAILABLE",
          })),
        },
      },
      include: {
        seats: true,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Failed to create section:", error);
    return NextResponse.json(
      { message: "Failed to create section" },
      { status: 500 }
    );
  }
}
