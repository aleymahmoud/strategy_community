import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import GuestDirectoryView from "@/components/events/GuestDirectoryView";

export const dynamic = "force-dynamic";

async function getEventWithAttendees(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      attendees: {
        where: {
          status: { in: ["CONFIRMED", "ATTENDED"] },
        },
        include: {
          member: true,
          seat: {
            include: {
              section: true,
            },
          },
        },
        orderBy: {
          member: { name: "asc" },
        },
      },
    },
  });
}

export default async function PublicGuestDirectoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventWithAttendees(id);

  if (!event) {
    notFound();
  }

  const guests = event.attendees.map((a) => ({
    id: a.member.id,
    name: a.member.name,
    title: a.member.title || "",
    company: a.member.company || "",
    photo: a.member.photo || null,
  }));

  // Build seating tables: group attendees by section (table)
  const tableMap = new Map<string, { name: string; members: string[] }>();
  for (const a of event.attendees) {
    if (a.seat?.section) {
      const sectionId = a.seat.section.id;
      if (!tableMap.has(sectionId)) {
        tableMap.set(sectionId, { name: a.seat.section.name, members: [] });
      }
      tableMap.get(sectionId)!.members.push(a.member.name);
    }
  }
  // Sort members alphabetically within each table, sort tables by name
  const seatingTables = Array.from(tableMap.values())
    .map((t) => ({ name: t.name, members: t.members.sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <GuestDirectoryView
      eventName={event.name}
      eventDate={event.date.toISOString()}
      guests={guests}
      seatingTables={seatingTables}
    />
  );
}
