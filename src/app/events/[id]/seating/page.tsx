"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
}

interface Seat {
  id: string;
  label: string;
  positionX: number;
  positionY: number;
  status: string;
}

interface Section {
  id: string;
  name: string;
  type: string;
  capacity: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  seats: Seat[];
}

interface Layout {
  id: string;
  name: string;
  width: number;
  height: number;
  sections: Section[];
}

interface Attendee {
  id: string;
  memberId: string;
  seatId: string | null;
  status: string;
  member: Member;
  seat: Seat | null;
}

interface Event {
  id: string;
  name: string;
  layout: Layout | null;
  attendees: Attendee[];
}

export default function SeatingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  async function assignSeat(attendeeId: string, seatId: string | null) {
    if (!event) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/events/${id}/attendees/${attendeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatId }),
      });

      if (!res.ok) throw new Error("Failed to assign seat");

      const updatedAttendee = await res.json();
      setEvent({
        ...event,
        attendees: event.attendees.map((a) =>
          a.id === attendeeId ? { ...a, seatId: updatedAttendee.seatId, seat: updatedAttendee.seat } : a
        ),
      });
      setSelectedAttendee(null);
    } catch (error) {
      console.error("Failed to assign seat:", error);
    } finally {
      setSaving(false);
    }
  }

  function getSeatAssignment(seatId: string) {
    return event?.attendees.find((a) => a.seatId === seatId);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Event not found</p>
        <Link href="/events" className="text-blue-500 hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  if (!event.layout) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/events/${id}`}
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Seating Plan: {event.name}
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No layout assigned to this event</p>
          <Link
            href={`/events/${id}/edit`}
            className="text-purple-500 hover:underline"
          >
            Edit event to assign a layout
          </Link>
        </div>
      </div>
    );
  }

  const unseatedAttendees = event.attendees.filter((a) => !a.seatId);
  const seatedAttendees = event.attendees.filter((a) => a.seatId);

  return (
    <div className="h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/events/${id}`}
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Seating: {event.name}
          </h1>
        </div>
        <div className="text-sm text-gray-600">
          {seatedAttendees.length}/{event.attendees.length} seated
        </div>
      </div>

      <div className="flex gap-4 h-full">
        {/* Attendees Panel */}
        <div className="w-64 bg-white rounded-lg shadow p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-3">
            Attendees ({event.attendees.length})
          </h3>

          {unseatedAttendees.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm text-gray-500 mb-2">Unseated</h4>
              <div className="space-y-1">
                {unseatedAttendees.map((attendee) => (
                  <button
                    key={attendee.id}
                    onClick={() => setSelectedAttendee(attendee.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedAttendee === attendee.id
                        ? "bg-purple-100 border border-purple-300"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {attendee.member.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {seatedAttendees.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-500 mb-2">Seated</h4>
              <div className="space-y-1">
                {seatedAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex justify-between items-center px-3 py-2 bg-green-50 rounded text-sm"
                  >
                    <span>{attendee.member.name}</span>
                    <button
                      onClick={() => assignSeat(attendee.id, null)}
                      className="text-red-500 hover:text-red-700 text-xs"
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedAttendee && (
            <div className="mt-4 p-3 bg-purple-50 rounded">
              <p className="text-sm text-purple-800">
                Click on an empty seat to assign{" "}
                <strong>
                  {event.attendees.find((a) => a.id === selectedAttendee)?.member.name}
                </strong>
              </p>
              <button
                onClick={() => setSelectedAttendee(null)}
                className="text-xs text-purple-600 hover:underline mt-1"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Seating Canvas */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-auto p-4">
          <div
            className="relative bg-gray-50 border border-gray-200"
            style={{
              width: event.layout.width,
              height: event.layout.height,
              minWidth: event.layout.width,
              minHeight: event.layout.height,
            }}
          >
            {event.layout.sections.map((section) => (
              <div
                key={section.id}
                className="absolute"
                style={{
                  left: section.positionX,
                  top: section.positionY,
                  width: section.width,
                  height: section.height,
                }}
              >
                {/* Section background */}
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    section.type === "ROUND_TABLE"
                      ? "rounded-full bg-amber-100 border-2 border-amber-400"
                      : section.type === "ROW"
                      ? "bg-blue-50 border-2 border-blue-300 rounded"
                      : "bg-amber-100 border-2 border-amber-400 rounded-lg"
                  }`}
                >
                  <span className="text-xs font-medium text-gray-700">
                    {section.name}
                  </span>
                </div>

                {/* Seats */}
                {section.type === "ROUND_TABLE" &&
                  Array.from({ length: section.capacity }).map((_, i) => {
                    const angle = (i / section.capacity) * 2 * Math.PI - Math.PI / 2;
                    const seatX = section.width / 2 + (section.width / 2 + 15) * Math.cos(angle) - 14;
                    const seatY = section.height / 2 + (section.height / 2 + 15) * Math.sin(angle) - 14;
                    const seatLabel = `${section.name}-${i + 1}`;
                    const assignment = event.attendees.find(
                      (a) => a.seat?.label === seatLabel
                    );

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (selectedAttendee && !assignment) {
                            // Find or create seat and assign
                            const seat = section.seats.find((s) => s.label === seatLabel);
                            if (seat) {
                              assignSeat(selectedAttendee, seat.id);
                            }
                          }
                        }}
                        className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          assignment
                            ? "bg-green-500 text-white"
                            : selectedAttendee
                            ? "bg-purple-200 border-2 border-purple-400 hover:bg-purple-300 cursor-pointer"
                            : "bg-gray-200 border border-gray-400"
                        }`}
                        style={{ left: seatX, top: seatY }}
                        title={assignment?.member.name || `Seat ${i + 1}`}
                      >
                        {assignment ? assignment.member.name.charAt(0) : i + 1}
                      </button>
                    );
                  })}

                {section.type === "ROW" &&
                  Array.from({ length: section.capacity }).map((_, i) => {
                    const seatLabel = `${section.name}-${i + 1}`;
                    const assignment = event.attendees.find(
                      (a) => a.seat?.label === seatLabel
                    );

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (selectedAttendee && !assignment) {
                            const seat = section.seats.find((s) => s.label === seatLabel);
                            if (seat) {
                              assignSeat(selectedAttendee, seat.id);
                            }
                          }
                        }}
                        className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          assignment
                            ? "bg-green-500 text-white"
                            : selectedAttendee
                            ? "bg-purple-200 border-2 border-purple-400 hover:bg-purple-300 cursor-pointer"
                            : "bg-gray-200 border border-gray-400"
                        }`}
                        style={{
                          left: 5 + i * ((section.width - 10) / section.capacity),
                          top: section.height + 4,
                        }}
                        title={assignment?.member.name || `Seat ${i + 1}`}
                      >
                        {assignment ? assignment.member.name.charAt(0) : i + 1}
                      </button>
                    );
                  })}

                {section.type === "RECTANGULAR_TABLE" && (
                  <>
                    {Array.from({ length: Math.ceil(section.capacity / 2) }).map((_, i) => {
                      const seatLabel = `${section.name}-${i + 1}`;
                      const assignment = event.attendees.find(
                        (a) => a.seat?.label === seatLabel
                      );

                      return (
                        <button
                          key={`top-${i}`}
                          onClick={() => {
                            if (selectedAttendee && !assignment) {
                              const seat = section.seats.find((s) => s.label === seatLabel);
                              if (seat) {
                                assignSeat(selectedAttendee, seat.id);
                              }
                            }
                          }}
                          className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                            assignment
                              ? "bg-green-500 text-white"
                              : selectedAttendee
                              ? "bg-purple-200 border-2 border-purple-400 hover:bg-purple-300 cursor-pointer"
                              : "bg-gray-200 border border-gray-400"
                          }`}
                          style={{ left: 10 + i * 30, top: -20 }}
                          title={assignment?.member.name || `Seat ${i + 1}`}
                        >
                          {assignment ? assignment.member.name.charAt(0) : i + 1}
                        </button>
                      );
                    })}
                    {Array.from({ length: Math.floor(section.capacity / 2) }).map((_, i) => {
                      const seatNum = Math.ceil(section.capacity / 2) + i + 1;
                      const seatLabel = `${section.name}-${seatNum}`;
                      const assignment = event.attendees.find(
                        (a) => a.seat?.label === seatLabel
                      );

                      return (
                        <button
                          key={`bottom-${i}`}
                          onClick={() => {
                            if (selectedAttendee && !assignment) {
                              const seat = section.seats.find((s) => s.label === seatLabel);
                              if (seat) {
                                assignSeat(selectedAttendee, seat.id);
                              }
                            }
                          }}
                          className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                            assignment
                              ? "bg-green-500 text-white"
                              : selectedAttendee
                              ? "bg-purple-200 border-2 border-purple-400 hover:bg-purple-300 cursor-pointer"
                              : "bg-gray-200 border border-gray-400"
                          }`}
                          style={{ left: 10 + i * 30, top: section.height + 4 }}
                          title={assignment?.member.name || `Seat ${seatNum}`}
                        >
                          {assignment ? assignment.member.name.charAt(0) : seatNum}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
