"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
  email: string | null;
}

interface AddAttendeeFormProps {
  eventId: string;
  existingAttendeeIds: string[];
}

export default function AddAttendeeForm({ eventId, existingAttendeeIds }: AddAttendeeFormProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/members");
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const availableMembers = members.filter(
    (m) => !existingAttendeeIds.includes(m.id)
  );

  const filteredMembers = availableMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  function toggleMember(memberId: string) {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }

  function selectAll() {
    setSelectedMembers(filteredMembers.map((m) => m.id));
  }

  function clearSelection() {
    setSelectedMembers([]);
  }

  async function handleAdd() {
    if (selectedMembers.length === 0) return;
    setAdding(true);

    try {
      for (const memberId of selectedMembers) {
        await fetch(`/api/events/${eventId}/attendees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId }),
        });
      }
      setSelectedMembers([]);
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to add attendees:", error);
    } finally {
      setAdding(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        + Add Attendees
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Add Attendees</h3>
        <button
          onClick={() => {
            setShowForm(false);
            setSelectedMembers([]);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading members...</p>
      ) : availableMembers.length === 0 ? (
        <p className="text-gray-500">All members are already attendees</p>
      ) : (
        <>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={selectAll}
              className="text-xs text-purple-600 hover:underline"
            >
              Select all ({filteredMembers.length})
            </button>
            {selectedMembers.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-gray-500 hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-md mb-4">
            {filteredMembers.length === 0 ? (
              <p className="text-gray-500 p-3 text-sm">No members found</p>
            ) : (
              filteredMembers.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                    selectedMembers.includes(member.id) ? "bg-purple-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    {member.email && (
                      <p className="text-xs text-gray-500">{member.email}</p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={selectedMembers.length === 0 || adding}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding
              ? "Adding..."
              : `Add ${selectedMembers.length} Attendee${
                  selectedMembers.length !== 1 ? "s" : ""
                }`}
          </button>
        </>
      )}
    </div>
  );
}
