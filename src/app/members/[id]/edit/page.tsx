"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Link from "next/link";

const MEMBERSHIP_OPTIONS = [
  { value: "", label: "Select Membership" },
  { value: "PREMIUM", label: "Premium" },
  { value: "GUEST", label: "Guest" },
  { value: "CORE_MEMBER", label: "Core Member" },
  { value: "FREQUENT_GUEST", label: "Frequent Guest" },
  { value: "GRAY", label: "Gray" },
  { value: "POTENTIAL_GUEST", label: "Potential Guest" },
];

const LEVEL_OPTIONS = [
  { value: "", label: "Select Level" },
  { value: "ABOVE", label: "Above" },
  { value: "EQUAL", label: "Equal" },
  { value: "BELOW", label: "Below" },
];

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Select Experience" },
  { value: "EXPERT", label: "Expert" },
  { value: "SENIOR", label: "Senior" },
  { value: "MED_LEVEL", label: "Med Level" },
  { value: "JUNIOR", label: "Junior" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Select Type" },
  { value: "EXTERNAL", label: "External" },
  { value: "CLIENT", label: "Client" },
  { value: "TEAM", label: "Team" },
];

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  membership: string | null;
  level: string | null;
  experience: string | null;
  communication: number | null;
  managementLevel: string | null;
  title: string | null;
  company: string | null;
  contact: string | null;
  memberType: string | null;
  photo: string | null;
}

export default function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setPhotoBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await fetch(`/api/members/${id}`);
        if (!res.ok) throw new Error("Member not found");
        const data = await res.json();
        setMember(data);
        if (data.photo) {
          setPhotoPreview(data.photo);
          setPhotoBase64(data.photo);
        }
      } catch {
        setError("Failed to load member");
      } finally {
        setFetching(false);
      }
    }
    fetchMember();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string || null,
      phone: formData.get("phone") as string || null,
      address: formData.get("address") as string || null,
      notes: formData.get("notes") as string || null,
      membership: formData.get("membership") as string || null,
      level: formData.get("level") as string || null,
      experience: formData.get("experience") as string || null,
      communication: formData.get("communication") ? parseInt(formData.get("communication") as string) : null,
      managementLevel: formData.get("managementLevel") as string || null,
      title: formData.get("title") as string || null,
      company: formData.get("company") as string || null,
      contact: formData.get("contact") as string || null,
      memberType: formData.get("memberType") as string || null,
      photo: photoBase64,
    };

    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update member");
      }

      router.push(`/members/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 text-center text-red-600">
          Member not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/members/${id}`} className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Member</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Info</h2>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-2xl">{member.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo"
                    className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </label>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => { setPhotoPreview(null); setPhotoBase64(null); }}
                      className="ml-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={member.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={member.email || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={member.phone || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                Contact (Alternative)
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                defaultValue={member.contact || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={member.address || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Professional Info Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Info</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={member.title || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                defaultValue={member.company || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="memberType" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="memberType"
                name="memberType"
                defaultValue={member.memberType || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="managementLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Management Level
              </label>
              <input
                type="text"
                id="managementLevel"
                name="managementLevel"
                defaultValue={member.managementLevel || ""}
                placeholder="e.g., C-Level, Director, Manager"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Classification Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Classification</h2>

            <div>
              <label htmlFor="membership" className="block text-sm font-medium text-gray-700 mb-1">
                Membership
              </label>
              <select
                id="membership"
                name="membership"
                defaultValue={member.membership || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {MEMBERSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                id="level"
                name="level"
                defaultValue={member.level || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Experience
              </label>
              <select
                id="experience"
                name="experience"
                defaultValue={member.experience || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="communication" className="block text-sm font-medium text-gray-700 mb-1">
                Communication Level
              </label>
              <select
                id="communication"
                name="communication"
                defaultValue={member.communication?.toString() || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Level</option>
                <option value="1">1 - Basic</option>
                <option value="2">2 - Intermediate</option>
                <option value="3">3 - Advanced</option>
              </select>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional</h2>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={6}
                defaultValue={member.notes || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 border-t pt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update Member"}
          </button>
          <Link
            href={`/members/${id}`}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
