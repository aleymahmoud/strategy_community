import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const layouts = await prisma.layout.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sections: true, events: true } },
      },
    });
    return NextResponse.json(layouts);
  } catch (error) {
    console.error("Failed to fetch layouts:", error);
    return NextResponse.json(
      { message: "Failed to fetch layouts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, width, height, isTemplate } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const layout = await prisma.layout.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        width: width || 800,
        height: height || 600,
        isTemplate: isTemplate || false,
      },
    });

    return NextResponse.json(layout, { status: 201 });
  } catch (error) {
    console.error("Failed to create layout:", error);
    return NextResponse.json(
      { message: "Failed to create layout" },
      { status: 500 }
    );
  }
}
