'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string | null;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'USER' as 'ADMIN' | 'USER' | 'VIEWER',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.status === 403) {
        router.push('/');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch {
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'An error occurred');
        setIsSubmitting(false);
        return;
      }

      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', name: '', role: 'USER' });
      fetchUsers();
    } catch {
      setFormError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update user');
        return;
      }

      fetchUsers();
    } catch {
      alert('An error occurred');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
        return;
      }

      fetchUsers();
    } catch {
      alert('An error occurred');
    }
  };

  const openNewUserModal = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', name: '', role: 'USER' });
    setFormError('');
    setShowModal(true);
  };

  const roleConfig = {
    ADMIN: { bg: 'bg-[#d4a537]/10', text: 'text-[#d4a537]', dot: 'bg-[#d4a537]' },
    USER: { bg: 'bg-[#2d3e50]/10', text: 'text-[#2d3e50]', dot: 'bg-[#2d3e50]' },
    VIEWER: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#d4a537]/20 border-t-[#d4a537] rounded-full animate-spin" />
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[#d4a537] text-sm font-semibold tracking-wider uppercase mb-1">Administration</p>
          <h1 className="text-4xl font-bold text-[#2d3e50]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            User Management
          </h1>
        </div>
        <button
          onClick={openNewUserModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#d4a537] text-white font-semibold rounded-xl hover:bg-[#c49730] transition-all shadow-lg shadow-[#d4a537]/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-[#2d3e50]/5 transition-all duration-300 ${
              !user.isActive ? 'opacity-60' : ''
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Avatar & Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${
                  user.role === 'ADMIN'
                    ? 'bg-gradient-to-br from-[#d4a537] to-[#c49730]'
                    : 'bg-gradient-to-br from-[#2d3e50] to-[#3d5068]'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#2d3e50] truncate">{user.name}</h3>
                    {!user.isActive && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    @{user.username || 'no-username'} · {user.email}
                  </p>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${roleConfig[user.role].bg} ${roleConfig[user.role].text}`}>
                  <span className={`w-2 h-2 rounded-full ${roleConfig[user.role].dot}`} />
                  {user.role}
                </span>
              </div>

              {/* Meta Info */}
              <div className="hidden lg:flex items-center gap-8 text-sm text-gray-400">
                <div>
                  <p className="text-xs uppercase tracking-wider mb-0.5">Last Login</p>
                  <p className="text-[#2d3e50] font-medium">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-0.5">Joined</p>
                  <p className="text-[#2d3e50] font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2.5 rounded-xl bg-[#2d3e50]/5 text-[#2d3e50] hover:bg-[#2d3e50] hover:text-white transition-all"
                  title="Edit user"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleToggleActive(user)}
                  className={`p-2.5 rounded-xl transition-all ${
                    user.isActive
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                  title={user.isActive ? 'Deactivate user' : 'Activate user'}
                >
                  {user.isActive ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                  title="Delete user"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2d3e50]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#2d3e50] to-[#3d5068]">
              <h2 className="text-xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[#2d3e50] mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[#2d3e50] placeholder-gray-400 focus:outline-none focus:border-[#d4a537] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-[#2d3e50] mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    placeholder="johndoe"
                    required
                    pattern="[a-z0-9_]+"
                    title="Username can only contain lowercase letters, numbers, and underscores"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[#2d3e50] placeholder-gray-400 focus:outline-none focus:border-[#d4a537] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#2d3e50] mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[#2d3e50] placeholder-gray-400 focus:outline-none focus:border-[#d4a537] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[#2d3e50] mb-2">
                    Password {editingUser && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required={!editingUser}
                    minLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[#2d3e50] placeholder-gray-400 focus:outline-none focus:border-[#d4a537] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-[#2d3e50] mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'USER' | 'VIEWER' })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[#2d3e50] focus:outline-none focus:border-[#d4a537] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-[#d4a537] text-white font-semibold rounded-xl hover:bg-[#c49730] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    editingUser ? 'Update User' : 'Create User'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
