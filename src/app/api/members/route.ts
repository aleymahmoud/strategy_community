import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Search params
    const search = searchParams.get("search") || "";

    // Filter params
    const membership = searchParams.get("membership");
    const memberType = searchParams.get("memberType");
    const experience = searchParams.get("experience");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    if (membership) {
      where.membership = membership;
    }

    if (memberType) {
      where.memberType = memberType;
    }

    if (experience) {
      where.experience = experience;
    }

    // Get total count for pagination
    const total = await prisma.member.count({ where });

    // Get members with pagination
    const members = await prisma.member.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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
