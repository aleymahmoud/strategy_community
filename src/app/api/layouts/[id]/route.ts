import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const layout = await prisma.layout.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            seats: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!layout) {
      return NextResponse.json(
        { message: "Layout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(layout);
  } catch (error) {
    console.error("Failed to fetch layout:", error);
    return NextResponse.json(
      { message: "Failed to fetch layout" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, width, height, isTemplate } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const layout = await prisma.layout.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        width: width || 800,
        height: height || 600,
        isTemplate: isTemplate || false,
      },
    });

    return NextResponse.json(layout);
  } catch (error) {
    console.error("Failed to update layout:", error);
    return NextResponse.json(
      { message: "Failed to update layout" },
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
    await prisma.layout.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Layout deleted" });
  } catch (error) {
    console.error("Failed to delete layout:", error);
    return NextResponse.json(
      { message: "Failed to delete layout" },
      { status: 500 }
    );
  }
}
