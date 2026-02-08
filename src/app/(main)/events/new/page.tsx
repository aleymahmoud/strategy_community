"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Layout {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  email: string | null;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [layoutsRes, membersRes] = await Promise.all([
          fetch("/api/layouts"),
          fetch("/api/members?limit=1000"),
        ]);
        if (layoutsRes.ok) {
          const layoutsData = await layoutsRes.json();
          setLayouts(layoutsData);
        }
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData.members || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }
    fetchData();
  }, []);

  function toggleMember(memberId: string) {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }

  function selectAll() {
    setSelectedMembers(members.map((m) => m.id));
  }

  function deselectAll() {
    setSelectedMembers([]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      date: formData.get("date") as string,
      location: formData.get("location") as string || null,
      description: formData.get("description") as string || null,
      layoutId: formData.get("layoutId") as string || null,
      attendeeIds: selectedMembers,
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create event");
      }

      router.push("/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/events" className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Create New Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Event Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date *
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="layoutId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Venue Layout
              </label>
              <select
                id="layoutId"
                name="layoutId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">No layout selected</option>
                {layouts.map((layout) => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Select Attendees ({selectedMembers.length} selected)
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-blue-500 hover:underline"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="text-sm text-gray-500 hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          {members.length === 0 ? (
            <p className="text-gray-500">
              No members yet.{" "}
              <Link href="/members/new" className="text-blue-500 hover:underline">
                Add members first
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {members.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                    selectedMembers.includes(member.id)
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    className="w-4 h-4 text-green-600"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{member.name}</p>
                    {member.email && (
                      <p className="text-xs text-gray-500">{member.email}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
          <Link
            href="/events"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
