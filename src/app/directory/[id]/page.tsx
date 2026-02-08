import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import GuestDirectoryView from "@/components/events/GuestDirectoryView";

export const dynamic = "force-dynamic";

async function getEventWithAttendees(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      attendees: {
        include: {
          member: true,
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

  return (
    <GuestDirectoryView
      eventName={event.name}
      eventDate={event.date.toISOString()}
      guests={guests}
    />
  );
}
