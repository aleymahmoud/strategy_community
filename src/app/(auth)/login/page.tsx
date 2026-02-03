'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f5f5f5]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-[#2d3e50] relative overflow-hidden">
        {/* Chevron Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="chevrons" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M0 30 L30 0 L60 30" fill="none" stroke="white" strokeWidth="2"/>
                <path d="M0 60 L30 30 L60 60" fill="none" stroke="white" strokeWidth="2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#chevrons)" />
          </svg>
        </div>

        {/* Large Chevron Accent */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-[0.05]">
          <svg viewBox="0 0 100 200" className="h-full w-full" preserveAspectRatio="none">
            <path d="M0 0 L100 100 L0 200" fill="white"/>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="The Strategy Community"
              className="h-28 w-auto brightness-0 invert"
            />
          </div>

          {/* Tagline */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-[3px] bg-[#d4a537]"></div>
              <span className="text-white text-base font-bold tracking-[0.12em]" style={{ fontFamily: "'Montserrat', 'Arial Black', sans-serif" }}>
                SHAPING
              </span>
            </div>
            <div className="ml-[76px]">
              <span className="text-white text-base font-bold tracking-[0.12em]" style={{ fontFamily: "'Montserrat', 'Arial Black', sans-serif" }}>
                THE STRATEGY SCENE
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/60 text-center max-w-md leading-relaxed text-sm">
            The leading and only strategy community in Egypt. An exclusive, invitation-only
            network of CEOs, Managing Directors, and experienced consultants.
          </p>

          {/* Decorative Line */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#d4a537]/40"></div>
            <div className="w-20 h-px bg-gradient-to-r from-[#d4a537]/40 to-transparent"></div>
            <div className="w-3 h-3 rounded-full bg-[#d4a537]/60"></div>
            <div className="w-32 h-px bg-gradient-to-r from-[#d4a537]/60 to-[#d4a537]/20"></div>
            <div className="w-2 h-2 rounded-full bg-[#d4a537]/30"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="/logo.png"
              alt="The Strategy Community"
              className="h-20 w-auto mx-auto mb-4"
            />
            <div className="inline-block text-left">
              <div className="flex items-center gap-2">
                <div className="w-10 h-[2px] bg-[#d4a537]"></div>
                <span className="text-[#2d3e50] text-xs font-bold tracking-[0.1em]" style={{ fontFamily: "'Montserrat', 'Arial Black', sans-serif" }}>
                  SHAPING
                </span>
              </div>
              <div className="ml-[48px]">
                <span className="text-[#2d3e50] text-xs font-bold tracking-[0.1em]" style={{ fontFamily: "'Montserrat', 'Arial Black', sans-serif" }}>
                  THE STRATEGY SCENE
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#2d3e50] mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-500 text-sm">
                Sign in to access your exclusive community
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-[#2d3e50] mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="username or email"
                    required
                    autoComplete="username"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-[#2d3e50] placeholder-gray-400 focus:outline-none focus:border-[#d4a537] focus:ring-4 focus:ring-[#d4a537]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#2d3e50] mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-[#2d3e50] placeholder-gray-400 focus:outline-none focus:border-[#d4a537] focus:ring-4 focus:ring-[#d4a537]/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-[#d4a537] peer-checked:border-[#d4a537] transition-all"></div>
                    <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-[#2d3e50] transition-colors">
                    Remember me
                  </span>
                </label>
                <a href="/forgot-password" className="text-sm font-medium text-[#d4a537] hover:text-[#c49730] transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-[#2d3e50] text-white font-semibold rounded-xl hover:bg-[#3d5068] focus:outline-none focus:ring-4 focus:ring-[#2d3e50]/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-3">
                Exclusive access for community members
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#d4a537]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                  Secure Login
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#d4a537]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Invitation Only
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
