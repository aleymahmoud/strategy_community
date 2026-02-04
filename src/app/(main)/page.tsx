import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const [memberCount, eventCount, layoutCount] = await Promise.all([
    prisma.member.count(),
    prisma.event.count(),
    prisma.layout.count(),
  ]);

  const recentMembers = await prisma.member.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const upcomingEvents = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    take: 5,
    orderBy: { date: "asc" },
  });

  return { memberCount, eventCount, layoutCount, recentMembers, upcomingEvents };
}

export default async function Dashboard() {
  const { memberCount, eventCount, layoutCount, recentMembers, upcomingEvents } =
    await getStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-[#d4a537] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-1">Overview</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#2d3e50]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Dashboard
          </h1>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Members Card */}
        <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-[#2d3e50]/5 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2d3e50]/5 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2d3e50] to-[#3d5068] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Members</p>
            <p className="text-3xl sm:text-5xl font-bold text-[#2d3e50] mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{memberCount}</p>
            <Link
              href="/members"
              className="inline-flex items-center gap-2 mt-4 text-[#2d3e50] text-sm font-medium hover:text-[#d4a537] transition-colors"
            >
              View all
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Events Card */}
        <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-[#d4a537]/10 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d4a537]/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a537] to-[#c49730] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Events</p>
            <p className="text-3xl sm:text-5xl font-bold text-[#2d3e50] mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{eventCount}</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 mt-4 text-[#2d3e50] text-sm font-medium hover:text-[#d4a537] transition-colors"
            >
              View all
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Layouts Card */}
        <div className="group relative bg-gradient-to-br from-[#2d3e50] to-[#1a2836] rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#d4a537]/10 rounded-tr-full" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#d4a537]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <p className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-wider">Venue Layouts</p>
            <p className="text-3xl sm:text-5xl font-bold text-white mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{layoutCount}</p>
            <Link
              href="/layouts"
              className="inline-flex items-center gap-2 mt-4 text-[#d4a537] text-sm font-medium hover:text-white transition-colors"
            >
              View all
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2d3e50]/5 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#2d3e50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#2d3e50]">Recent Members</h2>
            </div>
            <Link
              href="/members/new"
              className="px-4 py-2 bg-[#2d3e50] text-white text-sm font-medium rounded-xl hover:bg-[#3d5068] transition-colors"
            >
              + Add New
            </Link>
          </div>
          <div className="p-6">
            {recentMembers.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-400">No members yet</p>
                <Link href="/members/new" className="text-[#d4a537] hover:underline text-sm mt-2 inline-block">
                  Add your first member
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentMembers.map((member, index) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2d3e50] to-[#3d5068] flex items-center justify-center text-white font-semibold shadow-lg shadow-[#2d3e50]/20">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#2d3e50] truncate">{member.name}</p>
                      <p className="text-sm text-gray-400 truncate">{member.email || "No email"}</p>
                    </div>
                    <Link
                      href={`/members/${member.id}`}
                      className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-[#2d3e50]/5 text-[#2d3e50] text-xs font-medium rounded-lg hover:bg-[#2d3e50]/10 transition-all"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d4a537]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#d4a537]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#2d3e50]">Upcoming Events</h2>
            </div>
            <Link
              href="/events/new"
              className="px-4 py-2 bg-[#d4a537] text-white text-sm font-medium rounded-xl hover:bg-[#c49730] transition-colors"
            >
              + Create
            </Link>
          </div>
          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#d4a537]/5 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#d4a537]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400">No upcoming events</p>
                <Link href="/events/new" className="text-[#d4a537] hover:underline text-sm mt-2 inline-block">
                  Schedule your first event
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <li
                    key={event.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a537] to-[#c49730] flex flex-col items-center justify-center text-white shadow-lg shadow-[#d4a537]/20">
                      <span className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-80">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#2d3e50] truncate">{event.name}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-[#d4a537]/10 text-[#d4a537] text-xs font-medium rounded-lg hover:bg-[#d4a537]/20 transition-all"
                    >
                      Details
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#2d3e50] to-[#3d5068] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a537]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Quick Actions
            </h3>
            <p className="text-white/60 text-sm">Manage your community efficiently</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/members/new"
              className="px-5 py-2.5 bg-white text-[#2d3e50] font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
            >
              Add Member
            </Link>
            <Link
              href="/events/new"
              className="px-5 py-2.5 bg-[#d4a537] text-white font-semibold rounded-xl hover:bg-[#c49730] transition-colors shadow-lg"
            >
              Create Event
            </Link>
            <Link
              href="/layouts/new"
              className="px-5 py-2.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              New Layout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
