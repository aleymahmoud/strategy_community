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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[#d4a537] text-sm font-semibold tracking-wider uppercase mb-1">Calendar</p>
          <h1 className="text-4xl font-bold text-[#2d3e50]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Events
          </h1>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#d4a537] text-white font-semibold rounded-xl hover:bg-[#c49730] transition-all shadow-lg shadow-[#d4a537]/20 hover:shadow-xl hover:shadow-[#d4a537]/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-24 h-24 rounded-full bg-[#d4a537]/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-[#d4a537]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#2d3e50] mb-2">No events yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start building your community calendar by creating your first event
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4a537] text-white font-semibold rounded-xl hover:bg-[#c49730] transition-colors"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event, index) => {
            const isPast = new Date(event.date) < new Date();
            const eventDate = new Date(event.date);

            return (
              <div
                key={event.id}
                className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#2d3e50]/5 transition-all duration-300 ${
                  isPast ? "opacity-70" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Date Column */}
                  <div className={`md:w-32 p-6 flex md:flex-col items-center justify-center gap-3 md:gap-1 ${
                    isPast
                      ? "bg-gray-100"
                      : "bg-gradient-to-br from-[#d4a537] to-[#c49730]"
                  }`}>
                    <span className={`text-4xl font-bold ${isPast ? "text-gray-400" : "text-white"}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {eventDate.getDate()}
                    </span>
                    <div className={`text-center ${isPast ? "text-gray-400" : "text-white/80"}`}>
                      <p className="text-sm font-medium uppercase tracking-wider">
                        {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-xs">
                        {eventDate.getFullYear()}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-[#2d3e50] group-hover:text-[#d4a537] transition-colors">
                            {event.name}
                          </h2>
                          {isPast ? (
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                              Past
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                              Upcoming
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {eventDate.toLocaleDateString('en-US', { weekday: 'long' })}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event._count.attendees} attendees
                          </span>
                          {event.layout && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                              </svg>
                              {event.layout.name}
                            </span>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2">
                        <Link
                          href={`/events/${event.id}`}
                          className="px-4 py-2 bg-[#2d3e50] text-white text-sm font-medium rounded-xl hover:bg-[#3d5068] transition-colors text-center"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/events/${event.id}/seating`}
                          className="px-4 py-2 bg-[#d4a537]/10 text-[#d4a537] text-sm font-medium rounded-xl hover:bg-[#d4a537]/20 transition-colors text-center"
                        >
                          Seating Plan
                        </Link>
                        <Link
                          href={`/events/${event.id}/edit`}
                          className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors text-center"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
