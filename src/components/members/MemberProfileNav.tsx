"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MemberProfileNavProps {
  currentId: string;
  currentName: string;
  prevMember: { id: string; name: string } | null;
  nextMember: { id: string; name: string } | null;
}

interface SearchResult {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
}

export default function MemberProfileNav({
  currentId,
  currentName,
  prevMember,
  nextMember,
}: MemberProfileNavProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/members?search=${encodeURIComponent(search)}&limit=8`);
        const data = await res.json();
        const filtered = (data.members || []).filter(
          (m: SearchResult) => m.id !== currentId
        );
        setResults(filtered);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search, currentId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(memberId: string) {
    setSearch("");
    setShowDropdown(false);
    router.push(`/members/${memberId}`);
  }

  return (
    <div className="flex items-center gap-3 flex-1 justify-end">
      {/* Search */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Jump to member..."
            className="w-48 pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute top-full mt-1 right-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
            {results.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-medium flex-shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {m.title || "No title"}
                    {m.company && ` at ${m.company}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && search.trim() && results.length === 0 && !searching && (
          <div className="absolute top-full mt-1 right-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-3 text-sm text-gray-500 text-center">
            No members found
          </div>
        )}
      </div>

      {/* Prev / Next */}
      <div className="flex items-center gap-1">
        {prevMember ? (
          <Link
            href={`/members/${prevMember.id}`}
            className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            title={`Previous: ${prevMember.name}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : (
          <span className="p-2 rounded-md border border-gray-200 text-gray-300 cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </span>
        )}
        {nextMember ? (
          <Link
            href={`/members/${nextMember.id}`}
            className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            title={`Next: ${nextMember.name}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <span className="p-2 rounded-md border border-gray-200 text-gray-300 cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
