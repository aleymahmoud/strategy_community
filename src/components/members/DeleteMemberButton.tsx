"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteMemberButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this member?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete member");
      }

      router.push("/members");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
