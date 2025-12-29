import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, capacity, positionX, positionY, rotation, width, height } = body;

    // Get current section to check if capacity or name changed
    const currentSection = await prisma.section.findUnique({
      where: { id },
      include: { seats: true },
    });

    if (!currentSection) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (positionX !== undefined) updateData.positionX = positionX;
    if (positionY !== undefined) updateData.positionY = positionY;
    if (rotation !== undefined) updateData.rotation = rotation;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;

    // If capacity or name changed, recreate seats
    const newCapacity = capacity !== undefined ? capacity : currentSection.capacity;
    const newName = name !== undefined ? name.trim() : currentSection.name;
    const capacityChanged = capacity !== undefined && capacity !== currentSection.capacity;
    const nameChanged = name !== undefined && name.trim() !== currentSection.name;

    if (capacityChanged || nameChanged) {
      // Delete existing seats that aren't assigned to attendees
      await prisma.seat.deleteMany({
        where: {
          sectionId: id,
          attendees: { none: {} },
        },
      });

      // Create new seats for the new capacity
      const existingSeats = await prisma.seat.findMany({
        where: { sectionId: id },
      });
      const existingLabels = new Set(existingSeats.map(s => s.label));

      const seatsToCreate: { sectionId: string; label: string; positionX: number; positionY: number; status: "AVAILABLE" }[] = [];
      for (let i = 0; i < newCapacity; i++) {
        const label = `${newName}-${i + 1}`;
        if (!existingLabels.has(label)) {
          seatsToCreate.push({
            sectionId: id,
            label,
            positionX: 0,
            positionY: 0,
            status: "AVAILABLE" as const,
          });
        }
      }

      if (seatsToCreate.length > 0) {
        await prisma.seat.createMany({ data: seatsToCreate });
      }
    }

    const section = await prisma.section.update({
      where: { id },
      data: updateData,
      include: {
        seats: true,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Failed to update section:", error);
    return NextResponse.json(
      { message: "Failed to update section" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.section.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Section deleted" });
  } catch (error) {
    console.error("Failed to delete section:", error);
    return NextResponse.json(
      { message: "Failed to delete section" },
      { status: 500 }
    );
  }
}
