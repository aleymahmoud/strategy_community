import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getEvents() {
  return prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: {
        select: { attendees: true },
      },
      layout: {
        select: { name: true },
      },
    },
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Events</h1>
        <Link
          href="/events/new"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          + Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No events yet</p>
          <Link href="/events/new" className="text-green-500 hover:underline">
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const isPast = new Date(event.date) < new Date();
            return (
              <div
                key={event.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  isPast ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {event.name}
                    </h2>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {event.location && (
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {event.location}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Attendees:</span>{" "}
                        {event._count.attendees}
                      </p>
                      {event.layout && (
                        <p>
                          <span className="font-medium">Layout:</span>{" "}
                          {event.layout.name}
                        </p>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-2 text-gray-600">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isPast ? (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        Past
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded text-sm">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex gap-4">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/events/${event.id}/seating`}
                    className="text-purple-500 hover:underline"
                  >
                    Seating Plan
                  </Link>
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="text-gray-500 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
