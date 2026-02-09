'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { membershipColors, formatMembership } from '@/lib/constants';

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  linkedin: string | null;
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
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const MEMBERSHIP_OPTIONS = [
  { value: '', label: 'All Memberships' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'CORE_MEMBER', label: 'Core Member' },
  { value: 'FREQUENT_GUEST', label: 'Frequent Guest' },
  { value: 'GUEST', label: 'Guest' },
  { value: 'POTENTIAL_GUEST', label: 'Potential Guest' },
  { value: 'GRAY', label: 'Gray' },
];

const MEMBER_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'EXTERNAL', label: 'External' },
  { value: 'CLIENT', label: 'Client' },
  { value: 'TEAM', label: 'Team' },
];

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'All Experience' },
  { value: 'EXPERT', label: 'Expert' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'MED_LEVEL', label: 'Mid Level' },
  { value: 'JUNIOR', label: 'Junior' },
];


export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [membership, setMembership] = useState('');
  const [memberType, setMemberType] = useState('');
  const [experience, setExperience] = useState('');

  // Handle selecting a member and showing profile on mobile
  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    if (window.innerWidth < 1024) {
      setShowMobileProfile(true);
    }
  };

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.set('search', search);
      if (membership) params.set('membership', membership);
      if (memberType) params.set('memberType', memberType);
      if (experience) params.set('experience', experience);

      const res = await fetch(`/api/members?${params}`);
      const data = await res.json();

      setMembers(data.members);
      setPagination(data.pagination);

      // Auto-select first member if none selected
      if (data.members.length > 0 && !selectedMember) {
        setSelectedMember(data.members[0]);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, membership, memberType, experience]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  };


  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#2d3e50]">Members</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {pagination.total} member{pagination.total !== 1 ? 's' : ''} in your community
          </p>
        </div>
        <div className="flex gap-2">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Toggle filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <Link
            href="/members/new"
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-[#2d3e50] text-white rounded-lg hover:bg-[#3d5068] transition-colors font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Member</span>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d4a537] focus:ring-2 focus:ring-[#d4a537]/10"
              />
            </div>
          </div>

          {/* Filters - Hidden on mobile unless toggled */}
          <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap gap-2`}>
            <select
              value={membership}
              onChange={(e) => {
                setMembership(e.target.value);
                handleFilterChange();
              }}
              className="flex-1 lg:flex-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d4a537] bg-white lg:min-w-[150px]"
            >
              {MEMBERSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={memberType}
              onChange={(e) => {
                setMemberType(e.target.value);
                handleFilterChange();
              }}
              className="flex-1 lg:flex-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d4a537] bg-white lg:min-w-[120px]"
            >
              {MEMBER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={experience}
              onChange={(e) => {
                setExperience(e.target.value);
                handleFilterChange();
              }}
              className="flex-1 lg:flex-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d4a537] bg-white lg:min-w-[140px]"
            >
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {(search || membership || memberType || experience) && (
              <button
                onClick={() => {
                  setSearch('');
                  setMembership('');
                  setMemberType('');
                  setExperience('');
                  handleFilterChange();
                }}
                className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Profile Overlay */}
      {showMobileProfile && selectedMember && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileProfile(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-[#2d3e50]">Member Profile</h3>
              <button
                onClick={() => setShowMobileProfile(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Profile Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Header - Photo and Info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#d4a537]/20 flex-shrink-0">
                  {selectedMember.photo ? (
                    <img src={selectedMember.photo} alt={selectedMember.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#d4a537] to-[#b8922f] flex items-center justify-center text-2xl font-bold text-white">
                      {selectedMember.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-[#2d3e50] truncate">{selectedMember.name}</h2>
                  <p className="text-sm text-gray-500 truncate">{selectedMember.title || 'No title'}</p>
                  {selectedMember.company && <p className="text-xs text-gray-400 truncate">{selectedMember.company}</p>}
                  {selectedMember.membership && (
                    <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${membershipColors[selectedMember.membership]?.bg || 'bg-gray-100'} ${membershipColors[selectedMember.membership]?.text || 'text-gray-700'}`}>
                      {formatMembership(selectedMember.membership)}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {selectedMember.email && (
                  <a href={`mailto:${selectedMember.email}`} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600 truncate">{selectedMember.email}</span>
                  </a>
                )}
                {selectedMember.phone && (
                  <a href={`tel:${selectedMember.phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-600">{selectedMember.phone}</span>
                  </a>
                )}
                {selectedMember.linkedin && (
                  <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span className="text-sm text-gray-600">LinkedIn Profile</span>
                  </a>
                )}
              </div>

              {/* Notes */}
              {selectedMember.notes && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedMember.notes}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t bg-gray-50/80 flex gap-3">
              <Link
                href={`/members/${selectedMember.id}`}
                className="flex-1 py-3 text-center text-sm font-semibold bg-[#2d3e50] text-white rounded-xl hover:bg-[#3d5068] transition-colors"
              >
                View Full Profile
              </Link>
              <Link
                href={`/members/${selectedMember.id}/edit`}
                className="px-4 py-3 text-sm font-semibold bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Split View (hidden on mobile when profile overlay is shown) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Left Side - Members List */}
        <div className="flex-1 lg:w-1/2 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#d4a537] rounded-full animate-spin"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="font-medium">No members found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Members List */}
              <div className="flex-1 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleSelectMember(member)}
                    className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedMember?.id === member.id
                        ? 'bg-[#2d3e50]/5 border-l-4 border-l-[#d4a537]'
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#d4a537] flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[#2d3e50] truncate">{member.name}</h3>
                          {member.membership && (
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                membershipColors[member.membership]?.bg || 'bg-gray-100'
                              } ${membershipColors[member.membership]?.text || 'text-gray-700'}`}
                            >
                              {formatMembership(member.membership)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {member.title || 'No title'}
                          {member.company && ` at ${member.company}`}
                        </p>
                      </div>

                      {/* Edit Icon */}
                      <Link
                        href={`/members/${member.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-[#2d3e50] hover:bg-gray-100 transition-colors"
                        title="Edit member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50/50">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-[#2d3e50] text-white'
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Side - Profile Panel (hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {selectedMember ? (
            <div key={selectedMember.id} className="h-full flex flex-col animate-fade-in">
              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Header - Photo Left, Info Right */}
                <div className="flex items-center gap-4">
                  {/* Photo */}
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-[#d4a537]/20 flex-shrink-0 animate-scale-in">
                    {selectedMember.photo ? (
                      <img
                        src={selectedMember.photo}
                        alt={selectedMember.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#d4a537] to-[#b8922f] flex items-center justify-center text-3xl font-bold text-white">
                        {selectedMember.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center animate-slide-in">
                    <h2 className="text-lg font-semibold text-[#2d3e50] truncate">{selectedMember.name}</h2>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {selectedMember.title || 'No title'}
                    </p>
                    {selectedMember.company && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{selectedMember.company}</p>
                    )}
                    {selectedMember.membership && (
                      <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-medium rounded w-fit ${membershipColors[selectedMember.membership]?.bg || 'bg-gray-100'} ${membershipColors[selectedMember.membership]?.text || 'text-gray-700'}`}>
                        {formatMembership(selectedMember.membership)}
                      </span>
                    )}
                    {/* Edit Button */}
                    <Link
                      href={`/members/${selectedMember.id}/edit`}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#2d3e50] transition-colors text-xs font-medium w-fit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </Link>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 pt-3 border-t border-gray-100 animate-fade-in-delay-1">
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.email && (
                      <a href={`mailto:${selectedMember.email}`} className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-600 hover:text-[#2d3e50]">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate max-w-[120px]">{selectedMember.email}</span>
                      </a>
                    )}
                    {selectedMember.phone && (
                      <a href={`tel:${selectedMember.phone}`} className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-600 hover:text-[#2d3e50]">
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {selectedMember.phone}
                      </a>
                    )}
                    {selectedMember.linkedin && (
                      <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-600 hover:text-[#2d3e50]">
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in-delay-2">
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Details</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedMember.experience && (
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-[10px] text-gray-400">Experience</p>
                        <p className="text-xs font-medium text-[#2d3e50]">{formatMembership(selectedMember.experience)}</p>
                      </div>
                    )}
                    {selectedMember.memberType && (
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-[10px] text-gray-400">Type</p>
                        <p className="text-xs font-medium text-[#2d3e50]">{formatMembership(selectedMember.memberType)}</p>
                      </div>
                    )}
                    {selectedMember.level && (
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-[10px] text-gray-400">Level</p>
                        <p className="text-xs font-medium text-[#2d3e50]">{formatMembership(selectedMember.level)}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-[10px] text-gray-400">Since</p>
                      <p className="text-xs font-medium text-[#2d3e50]">
                        {new Date(selectedMember.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedMember.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in-delay-3">
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                    <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 line-clamp-2">
                      {selectedMember.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Fixed Action Button */}
              <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50/80">
                <Link
                  href={`/members/${selectedMember.id}`}
                  className="block w-full py-3 text-center text-sm font-semibold bg-[#2d3e50] text-white rounded-xl hover:bg-[#3d5068] transition-colors shadow-sm"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p className="font-medium text-gray-500">Select a member</p>
              <p className="text-sm mt-1">Click on a member to view their profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
