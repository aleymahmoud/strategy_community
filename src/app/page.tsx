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
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm uppercase tracking-wide">
            Total Members
          </h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">{memberCount}</p>
          <Link
            href="/members"
            className="text-blue-500 text-sm hover:underline mt-4 inline-block"
          >
            View all members
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm uppercase tracking-wide">
            Total Events
          </h2>
          <p className="text-4xl font-bold text-green-600 mt-2">{eventCount}</p>
          <Link
            href="/events"
            className="text-green-500 text-sm hover:underline mt-4 inline-block"
          >
            View all events
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm uppercase tracking-wide">
            Venue Layouts
          </h2>
          <p className="text-4xl font-bold text-purple-600 mt-2">{layoutCount}</p>
          <Link
            href="/layouts"
            className="text-purple-500 text-sm hover:underline mt-4 inline-block"
          >
            View all layouts
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Members
          </h2>
          {recentMembers.length === 0 ? (
            <p className="text-gray-500">No members yet</p>
          ) : (
            <ul className="space-y-3">
              {recentMembers.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email || "No email"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/members/new"
            className="mt-4 inline-block text-blue-500 hover:underline text-sm"
          >
            + Add new member
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Upcoming Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500">No upcoming events</p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{event.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/events/new"
            className="mt-4 inline-block text-green-500 hover:underline text-sm"
          >
            + Create new event
          </Link>
        </div>
      </div>
    </div>
  );
}
