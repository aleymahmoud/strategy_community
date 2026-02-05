"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  title: string | null;
}

interface Attendee {
  id: string;
  memberId: string;
  status: string;
  member: { id: string; name: string };
  seat: { label: string } | null;
}

interface EventAttendeesProps {
  eventId: string;
  attendees: Attendee[];
}

export default function EventAttendees({ eventId, attendees: initialAttendees }: EventAttendeesProps) {
  const router = useRouter();
  const [attendees, setAttendees] = useState(initialAttendees);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    INVITED: "bg-gray-100 text-gray-600",
    CONFIRMED: "bg-blue-100 text-blue-700",
    DECLINED: "bg-red-100 text-red-600",
    ATTENDED: "bg-green-100 text-green-700",
    ABSENT: "bg-yellow-100 text-yellow-700",
  };

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/members?limit=1000");
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const attendeeIds = new Set(attendees.map((a) => a.memberId));

  const availableMembers = members.filter(
    (m) => !attendeeIds.has(m.id) &&
      (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.company && m.company.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  async function handleQuickAdd(memberId: string) {
    setAddingId(memberId);
    try {
      const res = await fetch(`/api/events/${eventId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) {
        const newAttendee = await res.json();
        const member = members.find((m) => m.id === memberId);
        setAttendees([
          ...attendees,
          {
            ...newAttendee,
            member: { id: memberId, name: member?.name || "" },
            seat: null,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to add attendee:", error);
    } finally {
      setAddingId(null);
    }
  }

  async function handleRemove(attendeeId: string) {
    setRemovingId(attendeeId);
    try {
      const res = await fetch(`/api/events/${eventId}/attendees/${attendeeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAttendees(attendees.filter((a) => a.id !== attendeeId));
      }
    } catch (error) {
      console.error("Failed to remove attendee:", error);
    } finally {
      setRemovingId(null);
    }
  }

  async function handleStatusChange(attendeeId: string, status: string) {
    try {
      const res = await fetch(`/api/events/${eventId}/attendees/${attendeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setAttendees(attendees.map((a) => (a.id === attendeeId ? { ...a, status } : a)));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Attendees Table - Left (2/3) */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#2d3e50]">
            Attendees
            <span className="ml-2 px-2.5 py-0.5 text-sm font-medium bg-[#2d3e50] text-white rounded-full">
              {attendees.length}
            </span>
          </h2>
        </div>

        {attendees.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-1">No attendees yet</p>
            <p className="text-sm text-gray-400">Use the panel on the right to quickly add members</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seat</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/members/${attendee.member.id}`}
                        className="text-[#2d3e50] font-medium hover:text-[#d4a537] transition-colors"
                      >
                        {attendee.member.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={attendee.status}
                        onChange={(e) => handleStatusChange(attendee.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${statusColors[attendee.status] || "bg-gray-100"}`}
                      >
                        <option value="INVITED">INVITED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="DECLINED">DECLINED</option>
                        <option value="ATTENDED">ATTENDED</option>
                        <option value="ABSENT">ABSENT</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {attendee.seat?.label || "-"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleRemove(attendee.id)}
                        disabled={removingId === attendee.id}
                        className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Remove attendee"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Add Panel - Right (1/3) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
        <div className="px-5 py-4 border-b border-gray-100 bg-[#2d3e50] shrink-0">
          <h3 className="text-white font-semibold text-sm">Quick Add Members</h3>
          <p className="text-white/60 text-xs mt-0.5">{availableMembers.length} available</p>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4a537] focus:ring-1 focus:ring-[#d4a537]/30"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Loading members...</div>
          ) : availableMembers.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400 text-sm">
                {searchTerm ? "No members found" : "All members added"}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {availableMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-[#2d3e50] truncate">{member.name}</p>
                    {(member.title || member.company) && (
                      <p className="text-xs text-gray-400 truncate">
                        {[member.title, member.company].filter(Boolean).join(" at ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleQuickAdd(member.id)}
                    disabled={addingId === member.id}
                    className="shrink-0 w-8 h-8 rounded-lg bg-[#d4a537]/10 text-[#d4a537] flex items-center justify-center hover:bg-[#d4a537] hover:text-white transition-all disabled:opacity-50 group-hover:scale-110"
                    title={`Add ${member.name}`}
                  >
                    {addingId === member.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
