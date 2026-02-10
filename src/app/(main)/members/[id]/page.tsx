import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import DeleteMemberButton from "@/components/members/DeleteMemberButton";
import MemberProfileNav from "@/components/members/MemberProfileNav";
import { formatMembership, formatGuestStatus, membershipColors, guestStatusColors, calculateMemberScore, classifyMemberScore } from "@/lib/constants";

export const dynamic = "force-dynamic";

const MEMBERSHIP_LABELS: Record<string, string> = {
  FREQUENT: "Frequent",
  NON_FREQUENT: "Non Frequent",
  NEW: "New",
  POTENTIAL: "Potential",
};

const LEVEL_LABELS: Record<string, string> = {
  ABOVE: "Above",
  EQUAL: "Equal",
  BELOW: "Below",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  EXPERT: "Expert",
  SENIOR: "Senior",
  MED_LEVEL: "Med Level",
  JUNIOR: "Junior",
};

const TYPE_LABELS: Record<string, string> = {
  EXTERNAL: "External",
  CLIENT: "Client",
  TEAM: "Team",
};

const MEMBERSHIP_COLORS: Record<string, string> = {
  FREQUENT: "bg-green-100 text-green-700",
  NON_FREQUENT: "bg-gray-100 text-gray-700",
  NEW: "bg-blue-100 text-blue-700",
  POTENTIAL: "bg-purple-100 text-purple-700",
};

async function getMember(id: string) {
  return prisma.member.findUnique({
    where: { id },
    include: {
      eventAttendees: {
        include: {
          event: true,
        },
      },
    },
  });
}

async function getAdjacentMembers(name: string) {
  const [prev, next] = await Promise.all([
    prisma.member.findFirst({
      where: { name: { lt: name } },
      orderBy: { name: "desc" },
      select: { id: true, name: true },
    }),
    prisma.member.findFirst({
      where: { name: { gt: name } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  return { prev, next };
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  const { prev, next } = await getAdjacentMembers(member.name);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/members" className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{member.name}</h1>
        {member.membership && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${MEMBERSHIP_COLORS[member.membership] || "bg-gray-100"}`}>
            {MEMBERSHIP_LABELS[member.membership] || member.membership}
          </span>
        )}
        {member.guestStatus && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${guestStatusColors[member.guestStatus]?.bg || "bg-gray-100"} ${guestStatusColors[member.guestStatus]?.text || "text-gray-700"}`}>
            {formatGuestStatus(member.guestStatus)}
          </span>
        )}
        <MemberProfileNav
          currentId={member.id}
          currentName={member.name}
          prevMember={prev}
          nextMember={next}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-purple-600 text-2xl font-medium">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              {member.title && <p className="text-lg font-medium text-gray-800">{member.title}</p>}
              {member.company && <p className="text-gray-600">{member.company}</p>}
              {member.memberType && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  {TYPE_LABELS[member.memberType] || member.memberType}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/members/${member.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Edit
            </Link>
            <DeleteMemberButton memberId={member.id} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Info</h2>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="text-gray-800">{member.email || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="text-gray-800">{member.phone || "-"}</p>
            </div>
            {member.contact && (
              <div>
                <label className="text-sm text-gray-500">Alternative Contact</label>
                <p className="text-gray-800">{member.contact}</p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">Address</label>
              <p className="text-gray-800">{member.address || "-"}</p>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Classification</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Level</label>
                <p className="text-gray-800">
                  {member.level ? LEVEL_LABELS[member.level] || member.level : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Experience</label>
                <p className="text-gray-800">
                  {member.experience ? EXPERIENCE_LABELS[member.experience] || member.experience : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Communication</label>
                <p className="text-gray-800">
                  {member.communication ? `Level ${member.communication}` : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Management Level</label>
                <p className="text-gray-800">{member.managementLevel || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Guest Status</label>
                <p className="text-gray-800">
                  {member.guestStatus ? formatGuestStatus(member.guestStatus) : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Score</label>
                {(() => {
                  const score = calculateMemberScore(member);
                  if (score === null) return <p className="text-gray-800">-</p>;
                  const classification = classifyMemberScore(score);
                  return (
                    <p className={`font-medium ${classification.color}`}>
                      {score} · {classification.label}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Info</h2>
            <div>
              <label className="text-sm text-gray-500">Join Date</label>
              <p className="text-gray-800">
                {new Date(member.joinDate).toLocaleDateString()}
              </p>
            </div>
            {member.notes && (
              <div>
                <label className="text-sm text-gray-500">Notes</label>
                <p className="text-gray-800 whitespace-pre-wrap">{member.notes}</p>
              </div>
            )}
          </div>

          {/* Event History */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Event History ({member.eventAttendees.length})
            </h2>
            {member.eventAttendees.length === 0 ? (
              <p className="text-gray-500 text-sm">No events attended yet</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {member.eventAttendees.map((attendee) => (
                  <li key={attendee.id} className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        attendee.status === "ATTENDED"
                          ? "bg-green-500"
                          : attendee.status === "CONFIRMED"
                          ? "bg-blue-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <Link
                      href={`/events/${attendee.event.id}`}
                      className="text-purple-600 hover:underline truncate"
                    >
                      {attendee.event.name}
                    </Link>
                    <span className="text-gray-500 text-sm flex-shrink-0">
                      {new Date(attendee.event.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                      {attendee.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
