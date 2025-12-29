import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to fetch member:", error);
    return NextResponse.json(
      { message: "Failed to fetch member" },
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

    const member = await prisma.member.update({
      where: { id },
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

    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to update member:", error);
    return NextResponse.json(
      { message: "Failed to update member" },
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
    await prisma.member.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Member deleted" });
  } catch (error) {
    console.error("Failed to delete member:", error);
    return NextResponse.json(
      { message: "Failed to delete member" },
      { status: 500 }
    );
  }
}
