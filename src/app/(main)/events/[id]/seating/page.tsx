"use client";

import { useState, useEffect, useCallback, useMemo, use } from "react";
import Link from "next/link";
import {
  membershipColors,
  formatMembership,
  membershipOrder,
  calculateMemberScore,
  classifyTableScore,
  checkTableImbalance,
} from "@/lib/constants";

interface Member {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  membership: string | null;
  photo: string | null;
  level: string | null;
  experience: string | null;
  communication: number | null;
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

interface EventData {
  id: string;
  name: string;
  layout: Layout | null;
  attendees: Attendee[];
}

interface DragState {
  attendeeId: string;
  name: string;
  x: number;
  y: number;
}

export default function SeatingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [hoveredSeatLabel, setHoveredSeatLabel] = useState<string | null>(null);
  const [hoveredAttendee, setHoveredAttendee] = useState<{
    attendee: Attendee;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        // Only show confirmed/attended attendees in seating plan
        data.attendees = data.attendees.filter(
          (a: Attendee) => a.status === "CONFIRMED" || a.status === "ATTENDED"
        );
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
          a.id === attendeeId
            ? { ...a, seatId: updatedAttendee.seatId, seat: updatedAttendee.seat }
            : a
        ),
      });
    } catch (error) {
      console.error("Failed to assign seat:", error);
    } finally {
      setSaving(false);
    }
  }

  // Pointer-based drag: track mouse movement globally
  const handlePointerMove = useCallback((e: PointerEvent) => {
    setDragging((prev) =>
      prev ? { ...prev, x: e.clientX, y: e.clientY } : null
    );
  }, []);

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!dragging) return;

      // Find the seat element under the cursor
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const seatEl = el?.closest("[data-seat-id]") as HTMLElement | null;

      if (seatEl) {
        const seatId = seatEl.getAttribute("data-seat-id");
        const isEmpty = seatEl.getAttribute("data-seat-empty") === "true";
        if (seatId && isEmpty) {
          assignSeat(dragging.attendeeId, seatId);
        }
      }

      setDragging(null);
      setHoveredSeatLabel(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging]
  );

  useEffect(() => {
    if (!dragging) return;

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  function startDrag(e: React.PointerEvent, attendeeId: string, name: string) {
    e.preventDefault();
    setHoveredAttendee(null);
    setDragging({
      attendeeId,
      name,
      x: e.clientX,
      y: e.clientY,
    });
  }

  // Hover profile handlers
  function handleSeatMouseEnter(e: React.MouseEvent, attendee: Attendee) {
    if (dragging) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoveredAttendee({
      attendee,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }

  // Render a single seat element
  function renderSeat(
    seatLabel: string,
    section: Section,
    posX: number,
    posY: number,
    key: string | number
  ) {
    const assignment = event?.attendees.find((a) => a.seat?.label === seatLabel);
    const seat = section.seats.find((s) => s.label === seatLabel);
    const isDragActive = !!dragging;
    const isEmpty = !assignment;
    const isHovered = hoveredSeatLabel === seatLabel && isDragActive && isEmpty;

    return (
      <div
        key={key}
        data-seat-id={seat?.id || ""}
        data-seat-empty={isEmpty ? "true" : "false"}
        className={`absolute flex items-center justify-center font-medium transition-all select-none ${
          assignment
            ? "bg-green-500 text-white h-7 px-2.5 rounded-full shadow-sm text-[11px] cursor-grab active:cursor-grabbing hover:bg-green-600"
            : isHovered
            ? "border-2 border-purple-500 bg-purple-400 text-white rounded-full text-xs scale-125 ring-2 ring-purple-300"
            : isDragActive && isEmpty
            ? "border-2 border-purple-400 bg-purple-100 text-purple-700 rounded-full text-xs"
            : "bg-gray-200 border border-gray-300 rounded-full text-xs text-gray-400"
        }`}
        style={{
          left: posX,
          top: posY,
          transform: "translate(-50%, -50%)",
          maxWidth: assignment ? 110 : undefined,
          width: assignment ? undefined : (isDragActive ? 36 : 28),
          height: assignment ? undefined : (isDragActive ? 36 : 28),
          zIndex: isHovered ? 10 : assignment ? 2 : 1,
        }}
        onPointerDown={(e) => {
          if (assignment) {
            startDrag(e, assignment.id, assignment.member.name);
          }
        }}
        onPointerEnter={() => {
          if (isDragActive && isEmpty) {
            setHoveredSeatLabel(seatLabel);
          }
        }}
        onPointerLeave={() => {
          if (hoveredSeatLabel === seatLabel) {
            setHoveredSeatLabel(null);
          }
        }}
        onMouseEnter={(e) => assignment && handleSeatMouseEnter(e, assignment)}
        onMouseLeave={() => setHoveredAttendee(null)}
      >
        <span className="truncate">
          {assignment ? assignment.member.name : seatLabel.split("-").pop()}
        </span>
      </div>
    );
  }

  const unseatedAttendees = event?.attendees.filter((a) => !a.seatId) ?? [];
  const seatedAttendees = event?.attendees.filter((a) => a.seatId) ?? [];

  // Group unseated by membership
  const unseatedByMembership = useMemo(() => {
    const groups: Record<string, Attendee[]> = {};
    for (const a of unseatedAttendees) {
      const key = a.member.membership || "UNKNOWN";
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    }
    return groups;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  // Compute table scores per section
  const tableScores = useMemo(() => {
    if (!event?.layout) return {};
    const scores: Record<
      string,
      { avg: number; label: string; emoji: string; color: string; imbalanced: boolean }
    > = {};

    for (const section of event.layout.sections) {
      if (!["ROUND_TABLE", "RECTANGULAR_TABLE"].includes(section.type)) continue;

      const seatedAtTable = event.attendees.filter(
        (a) => a.seat?.label.startsWith(section.name + "-")
      );
      if (seatedAtTable.length === 0) continue;

      const memberScores = seatedAtTable
        .map((a) => calculateMemberScore(a.member))
        .filter((s): s is number => s !== null);

      if (memberScores.length === 0) continue;

      const avg =
        memberScores.reduce((sum, s) => sum + s, 0) / memberScores.length;
      const classification = classifyTableScore(avg);
      const imbalanced = checkTableImbalance(memberScores);
      scores[section.id] = {
        avg: Math.round(avg * 10) / 10,
        ...classification,
        imbalanced,
      };
    }

    return scores;
  }, [event]);

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
        <div className="w-72 bg-white rounded-lg shadow p-4 overflow-y-auto flex-shrink-0">
          <h3 className="font-semibold text-gray-800 mb-3">
            Attendees ({event.attendees.length})
          </h3>

          {unseatedAttendees.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm text-gray-500 mb-2">
                Unseated ({unseatedAttendees.length})
              </h4>
              {[...membershipOrder, "UNKNOWN"].map((type) => {
                const group = unseatedByMembership[type];
                if (!group || group.length === 0) return null;
                const colors = membershipColors[type];
                return (
                  <div key={type} className="mb-2">
                    <div
                      className={`text-[10px] font-semibold px-2 py-1 rounded ${
                        colors
                          ? `${colors.bg} ${colors.text}`
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {type === "UNKNOWN"
                        ? "Unclassified"
                        : formatMembership(type)}{" "}
                      ({group.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {group.map((attendee) => (
                        <div
                          key={attendee.id}
                          onPointerDown={(e) =>
                            startDrag(e, attendee.id, attendee.member.name)
                          }
                          className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors cursor-grab active:cursor-grabbing select-none ${
                            dragging?.attendeeId === attendee.id
                              ? "bg-purple-50 opacity-50"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8h16M4 16h16"
                              />
                            </svg>
                            <span className="truncate">
                              {attendee.member.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {seatedAttendees.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-500 mb-2">Seated</h4>
              <div className="space-y-1">
                {seatedAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    onPointerDown={(e) =>
                      startDrag(e, attendee.id, attendee.member.name)
                    }
                    className="flex justify-between items-center px-3 py-2 bg-green-50 rounded text-sm cursor-grab active:cursor-grabbing select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                      <span className="truncate">{attendee.member.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {attendee.seat?.label}
                      </span>
                    </div>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => assignSeat(attendee.id, null)}
                      className="text-red-500 hover:text-red-700 text-xs flex-shrink-0 ml-2"
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seating Canvas */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-auto p-4">
          <div
            className="bg-gray-50 border border-gray-200"
            style={{
              width: event.layout.width + 300,
              height: event.layout.height + 200,
              minWidth: event.layout.width + 300,
              minHeight: event.layout.height + 200,
              boxSizing: "content-box",
              paddingTop: 80,
              paddingBottom: 80,
              paddingLeft: 40,
              paddingRight: 150,
            }}
          >
            <div className="relative" style={{ width: event.layout.width, height: event.layout.height }}>
            {event.layout.sections.map((section) => {
              const isVenueElement = [
                "STAGE",
                "SCREEN",
                "CATERING",
                "SOUND_SYSTEM",
                "PHOTO_SPOT",
              ].includes(section.type);

              return (
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
                        : isVenueElement
                        ? "bg-gray-100 border-2 border-gray-300 rounded-lg"
                        : "bg-amber-100 border-2 border-amber-400 rounded-lg"
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-xs font-medium text-gray-700">
                        {section.name}
                      </span>
                      {tableScores[section.id] && (
                        <div
                          className={`text-[9px] font-bold ${tableScores[section.id].color}`}
                        >
                          {tableScores[section.id].avg}{" "}
                          {tableScores[section.id].emoji}{" "}
                          {tableScores[section.id].imbalanced && "\u26A0\uFE0F"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Round Table Seats */}
                  {section.type === "ROUND_TABLE" &&
                    Array.from({ length: section.capacity }).map((_, i) => {
                      const angle =
                        (i / section.capacity) * 2 * Math.PI - Math.PI / 2;
                      const posX =
                        section.width / 2 +
                        (section.width / 2 + 35) * Math.cos(angle);
                      const posY =
                        section.height / 2 +
                        (section.height / 2 + 35) * Math.sin(angle);
                      return renderSeat(
                        `${section.name}-${i + 1}`,
                        section,
                        posX,
                        posY,
                        i
                      );
                    })}

                  {/* Row Seats */}
                  {section.type === "ROW" &&
                    Array.from({ length: section.capacity }).map((_, i) => {
                      const spacing = section.width / section.capacity;
                      const posX = spacing * (i + 0.5);
                      const posY = section.height + 20;
                      return renderSeat(
                        `${section.name}-${i + 1}`,
                        section,
                        posX,
                        posY,
                        i
                      );
                    })}

                  {/* Rectangular Table Seats */}
                  {section.type === "RECTANGULAR_TABLE" && (
                    <>
                      {/* Top seats */}
                      {Array.from({
                        length: Math.ceil(section.capacity / 2),
                      }).map((_, i) => {
                        const topCount = Math.ceil(section.capacity / 2);
                        const spacing = section.width / topCount;
                        const posX = spacing * (i + 0.5);
                        const posY = -20;
                        return renderSeat(
                          `${section.name}-${i + 1}`,
                          section,
                          posX,
                          posY,
                          `top-${i}`
                        );
                      })}
                      {/* Bottom seats */}
                      {Array.from({
                        length: Math.floor(section.capacity / 2),
                      }).map((_, i) => {
                        const bottomCount = Math.floor(section.capacity / 2);
                        const spacing = section.width / bottomCount;
                        const seatNum =
                          Math.ceil(section.capacity / 2) + i + 1;
                        const posX = spacing * (i + 0.5);
                        const posY = section.height + 20;
                        return renderSeat(
                          `${section.name}-${seatNum}`,
                          section,
                          posX,
                          posY,
                          `bottom-${i}`
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      {/* Drag floating label */}
      {dragging && (
        <div
          className="fixed z-[100] pointer-events-none bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg whitespace-nowrap"
          style={{
            left: dragging.x,
            top: dragging.y,
            transform: "translate(-50%, -120%)",
          }}
        >
          {dragging.name}
        </div>
      )}

      {/* Hover Profile Popover */}
      {hoveredAttendee && !dragging && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoveredAttendee.x,
            top: hoveredAttendee.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px]">
            <div className="flex items-center gap-3">
              {hoveredAttendee.attendee.member.photo ? (
                <img
                  src={hoveredAttendee.attendee.member.photo}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold flex-shrink-0">
                  {hoveredAttendee.attendee.member.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {hoveredAttendee.attendee.member.name}
                </p>
                {hoveredAttendee.attendee.member.title && (
                  <p className="text-xs text-gray-500 truncate">
                    {hoveredAttendee.attendee.member.title}
                  </p>
                )}
                {hoveredAttendee.attendee.member.company && (
                  <p className="text-xs text-gray-500 truncate">
                    {hoveredAttendee.attendee.member.company}
                  </p>
                )}
              </div>
            </div>
            {(hoveredAttendee.attendee.member.membership ||
              calculateMemberScore(hoveredAttendee.attendee.member) !== null) && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                {hoveredAttendee.attendee.member.membership && (() => {
                  const mc = membershipColors[hoveredAttendee.attendee.member.membership];
                  return (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        mc ? `${mc.bg} ${mc.text}` : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {formatMembership(hoveredAttendee.attendee.member.membership)}
                    </span>
                  );
                })()}
                {(() => {
                  const score = calculateMemberScore(hoveredAttendee.attendee.member);
                  return score !== null ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      Score: {score}/10
                    </span>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
