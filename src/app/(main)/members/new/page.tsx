"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import PhotoCropModal from "@/components/members/PhotoCropModal";

const MEMBERSHIP_OPTIONS = [
  { value: "", label: "Select Membership" },
  { value: "FREQUENT", label: "Frequent" },
  { value: "NON_FREQUENT", label: "Non Frequent" },
  { value: "NEW", label: "New" },
  { value: "POTENTIAL", label: "Potential" },
];

const GUEST_STATUS_OPTIONS = [
  { value: "", label: "Select Guest Status" },
  { value: "MEMBER", label: "Member" },
  { value: "DROPPED_GUEST", label: "Dropped Guest" },
  { value: "POTENTIAL_PREMIUM_GUEST", label: "Potential Premium Guest" },
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

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const raw = reader.result as string;
        setOriginalImageSrc(raw);
        setCropImageSrc(raw);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleCropConfirm(croppedBase64: string) {
    setPhotoPreview(croppedBase64);
    setPhotoBase64(croppedBase64);
    setCropImageSrc(null);
  }

  function handleCropCancel() {
    setCropImageSrc(null);
  }

  function handleEditPhoto() {
    if (originalImageSrc) {
      setCropImageSrc(originalImageSrc);
    }
  }

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
      guestStatus: formData.get("guestStatus") as string || null,
      photo: photoBase64,
    };

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create member");
      }

      router.push("/members");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[#2d3e50] placeholder-gray-400 focus:outline-none focus:border-[#d4a537] focus:bg-white transition-all";
  const selectClass = "w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[#2d3e50] focus:outline-none focus:border-[#d4a537] focus:bg-white transition-all appearance-none cursor-pointer";
  const labelClass = "block text-sm font-semibold text-[#2d3e50] mb-2";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#2d3e50] transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Members
        </Link>
        <div>
          <p className="text-[#d4a537] text-sm font-semibold tracking-wider uppercase mb-1">Members</p>
          <h1 className="text-4xl font-bold text-[#2d3e50]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Add New Member
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photo & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#2d3e50] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#d4a537]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#d4a537]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Photo
              </h2>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center border-4 border-white shadow-lg mb-4">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo"
                  className="px-4 py-2 bg-[#2d3e50]/5 text-[#2d3e50] text-sm font-medium rounded-xl hover:bg-[#2d3e50]/10 transition-colors cursor-pointer"
                >
                  Upload Photo
                </label>
                {photoPreview && originalImageSrc && (
                  <button
                    type="button"
                    onClick={handleEditPhoto}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Edit Photo
                  </button>
                )}
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setPhotoBase64(null); setOriginalImageSrc(null); }}
                    className="mt-2 text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Classification Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#2d3e50] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2d3e50]/5 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#2d3e50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                Classification
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="membership" className={labelClass}>Membership</label>
                  <div className="relative">
                    <select id="membership" name="membership" className={selectClass}>
                      {MEMBERSHIP_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label htmlFor="level" className={labelClass}>Level</label>
                  <div className="relative">
                    <select id="level" name="level" className={selectClass}>
                      {LEVEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label htmlFor="experience" className={labelClass}>Experience</label>
                  <div className="relative">
                    <select id="experience" name="experience" className={selectClass}>
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label htmlFor="communication" className={labelClass}>Communication</label>
                  <div className="relative">
                    <select id="communication" name="communication" className={selectClass}>
                      <option value="">Select Level</option>
                      <option value="1">1 - Basic</option>
                      <option value="2">2 - Intermediate</option>
                      <option value="3">3 - Advanced</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label htmlFor="guestStatus" className={labelClass}>Guest Status</label>
                  <div className="relative">
                    <select id="guestStatus" name="guestStatus" className={selectClass}>
                      {GUEST_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#2d3e50] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#d4a537]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#d4a537]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className={labelClass}>Full Name *</label>
                  <input type="text" id="name" name="name" required className={inputClass} placeholder="Enter full name" />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input type="email" id="email" name="email" className={inputClass} placeholder="email@example.com" />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone</label>
                  <input type="tel" id="phone" name="phone" className={inputClass} placeholder="+1 234 567 890" />
                </div>
                <div>
                  <label htmlFor="contact" className={labelClass}>Alternative Contact</label>
                  <input type="text" id="contact" name="contact" className={inputClass} placeholder="Secondary contact" />
                </div>
                <div>
                  <label htmlFor="address" className={labelClass}>Address</label>
                  <input type="text" id="address" name="address" className={inputClass} placeholder="City, Country" />
                </div>
              </div>
            </div>

            {/* Professional Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#2d3e50] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2d3e50]/5 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#2d3e50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className={labelClass}>Job Title</label>
                  <input type="text" id="title" name="title" className={inputClass} placeholder="CEO, Director, etc." />
                </div>
                <div>
                  <label htmlFor="company" className={labelClass}>Company</label>
                  <input type="text" id="company" name="company" className={inputClass} placeholder="Company name" />
                </div>
                <div>
                  <label htmlFor="memberType" className={labelClass}>Type</label>
                  <div className="relative">
                    <select id="memberType" name="memberType" className={selectClass}>
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label htmlFor="managementLevel" className={labelClass}>Management Level</label>
                  <input type="text" id="managementLevel" name="managementLevel" className={inputClass} placeholder="C-Level, Director, Manager" />
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#2d3e50] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                Notes
              </h2>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Additional notes about this member..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#d4a537] text-white font-semibold rounded-xl hover:bg-[#c49730] transition-all shadow-lg shadow-[#d4a537]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Member
                  </>
                )}
              </button>
              <Link
                href="/members"
                className="px-6 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>

      {/* Photo Crop Modal */}
      {cropImageSrc && (
        <PhotoCropModal
          imageSrc={cropImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
