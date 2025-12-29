import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return NextResponse.json(
      { message: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      notes,
      membership,
      level,
      experience,
      communication,
      managementLevel,
      title,
      company,
      contact,
      memberType,
      photo,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
        membership: membership || null,
        level: level || null,
        experience: experience || null,
        communication: communication || null,
        managementLevel: managementLevel?.trim() || null,
        title: title?.trim() || null,
        company: company?.trim() || null,
        contact: contact?.trim() || null,
        memberType: memberType || null,
        photo: photo || null,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Failed to create member:", error);
    return NextResponse.json(
      { message: "Failed to create member" },
      { status: 500 }
    );
  }
}
