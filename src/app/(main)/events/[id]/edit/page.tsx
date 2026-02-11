"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Link from "next/link";

interface Layout {
  id: string;
  name: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string | null;
  description: string | null;
  layoutId: string | null;
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [event, setEvent] = useState<Event | null>(null);
  const [layouts, setLayouts] = useState<Layout[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, layoutsRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch("/api/layouts"),
        ]);

        if (!eventRes.ok) throw new Error("Event not found");

        const eventData = await eventRes.json();
        const layoutsData = await layoutsRes.json();

        setEvent(eventData);
        setLayouts(layoutsData);
      } catch {
        setError("Failed to load event");
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [id]);

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
    };

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update event");
      }

      router.push(`/events/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 text-center text-red-600">
          Event not found
        </div>
      </div>
    );
  }

  // Convert UTC date to Cairo time (UTC+2) for datetime-local input
  const cairoDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000);
  const dateValue = cairoDate.toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/events/${id}`}
          className="text-gray-500 hover:text-gray-700"
        >
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
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
              defaultValue={event.name}
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
              defaultValue={dateValue}
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
              defaultValue={event.location || ""}
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
              defaultValue={event.layoutId || ""}
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

          <div>
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
              defaultValue={event.description || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update Event"}
          </button>
          <Link
            href={`/events/${id}`}
            className="w-full sm:w-auto text-center px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
