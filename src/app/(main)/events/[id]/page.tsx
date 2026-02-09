import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import DeleteEventButton from "@/components/events/DeleteEventButton";
import EventAttendees from "@/components/events/EventAttendees";
import DirectoryQRCode from "@/components/events/DirectoryQRCode";

export const dynamic = "force-dynamic";

async function getEvent(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      layout: true,
      attendees: {
        include: {
          member: true,
          seat: true,
        },
      },
    },
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const attendeesData = event.attendees.map((a) => ({
    id: a.id,
    memberId: a.memberId,
    status: a.status,
    whatsapp: a.whatsapp,
    followUp: a.followUp,
    introCall: a.introCall,
    comments: a.comments,
    member: {
      id: a.member.id,
      name: a.member.name,
      membership: a.member.membership,
      level: a.member.level,
      experience: a.member.experience,
      communication: a.member.communication,
    },
    seat: a.seat ? { label: a.seat.label } : null,
  }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/events" className="text-gray-400 hover:text-[#2d3e50] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2d3e50]">{event.name}</h1>
      </div>

      {/* Event Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#2d3e50]">
              <svg className="w-5 h-5 text-[#d4a537]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Africa/Cairo",
                })}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-[#d4a537]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
            )}
            {event.layout && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-[#d4a537]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <Link
                  href={`/layouts/${event.layout.id}/edit`}
                  className="text-[#d4a537] hover:underline"
                >
                  {event.layout.name}
                </Link>
              </div>
            )}
            {event.description && (
              <p className="text-gray-500 text-sm mt-3 pt-3 border-t border-gray-100">{event.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href={`/directory/${event.id}`}
              target="_blank"
              className="px-4 py-2 text-white rounded-xl hover:opacity-90 transition-colors text-sm font-medium shadow-sm flex items-center gap-1.5"
              style={{ backgroundColor: "#d4a537" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Guest Directory
            </Link>
            <Link
              href={`/events/${event.id}/seating`}
              className="px-4 py-2 bg-[#2d3e50] text-white rounded-xl hover:bg-[#3d5068] transition-colors text-sm font-medium shadow-sm"
            >
              Seating Plan
            </Link>
            <Link
              href={`/events/${event.id}/edit`}
              className="px-4 py-2 border border-gray-200 rounded-xl text-[#2d3e50] hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Edit
            </Link>
            <DeleteEventButton eventId={event.id} />
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="mb-6">
        <DirectoryQRCode eventId={event.id} eventName={event.name} />
      </div>

      {/* Attendees Section */}
      <EventAttendees eventId={event.id} attendees={attendeesData} />
    </div>
  );
}
