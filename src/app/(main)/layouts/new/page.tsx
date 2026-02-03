"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function NewLayoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
      width: parseInt(formData.get("width") as string) || 800,
      height: parseInt(formData.get("height") as string) || 600,
      isTemplate: formData.get("isTemplate") === "on",
    };

    try {
      const res = await fetch("/api/layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create layout");
      }

      const layout = await res.json();
      router.push(`/layouts/${layout.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/layouts" className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Create New Layout</h1>
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
              Layout Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g., Main Hall, Conference Room A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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
              rows={2}
              placeholder="Optional description of this layout"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="width"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Canvas Width (px)
              </label>
              <input
                type="number"
                id="width"
                name="width"
                defaultValue={800}
                min={400}
                max={2000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label
                htmlFor="height"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Canvas Height (px)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                defaultValue={600}
                min={300}
                max={2000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isTemplate"
              name="isTemplate"
              className="w-4 h-4 text-purple-600"
            />
            <label htmlFor="isTemplate" className="text-sm text-gray-700">
              Save as reusable template
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create & Edit Layout"}
          </button>
          <Link
            href="/layouts"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
