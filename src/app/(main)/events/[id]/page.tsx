import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import DeleteEventButton from "@/components/events/DeleteEventButton";
import AddAttendeeForm from "@/components/events/AddAttendeeForm";

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

  const statusColors: Record<string, string> = {
    INVITED: "bg-gray-100 text-gray-600",
    CONFIRMED: "bg-blue-100 text-blue-600",
    DECLINED: "bg-red-100 text-red-600",
    ATTENDED: "bg-green-100 text-green-600",
    ABSENT: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/events" className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{event.name}</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <p className="text-lg">
              <span className="text-gray-500">Date:</span>{" "}
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {event.location && (
              <p>
                <span className="text-gray-500">Location:</span> {event.location}
              </p>
            )}
            {event.layout && (
              <p>
                <span className="text-gray-500">Layout:</span>{" "}
                <Link
                  href={`/layouts/${event.layout.id}/edit`}
                  className="text-purple-500 hover:underline"
                >
                  {event.layout.name}
                </Link>
              </p>
            )}
            {event.description && (
              <p className="text-gray-600 mt-4">{event.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/events/${event.id}/seating`}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Seating Plan
            </Link>
            <Link
              href={`/events/${event.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Edit
            </Link>
            <DeleteEventButton eventId={event.id} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Attendees ({event.attendees.length})
          </h2>
          <AddAttendeeForm
            eventId={event.id}
            existingAttendeeIds={event.attendees.map((a) => a.memberId)}
          />
        </div>

        {event.attendees.length === 0 ? (
          <p className="text-gray-500">No attendees added yet. Click &quot;+ Add Attendees&quot; to invite members.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">
                    Name
                  </th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">
                    Seat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {event.attendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/members/${attendee.member.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {attendee.member.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          statusColors[attendee.status] || "bg-gray-100"
                        }`}
                      >
                        {attendee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {attendee.seat?.label || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
