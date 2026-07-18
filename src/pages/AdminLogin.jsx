import React, { useState } from 'react';
import axios from 'axios';
import { HiMail, HiLockClosed, HiArrowLeft } from 'react-icons/hi';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Connect to the Node.js backend authentication path
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      if (response.data && response.data.success) {
        // Cache the verified JWT authorization session token in browser local storage
        localStorage.setItem('adminToken', response.data.token);
        setSuccess(true);
        
        // Simulating redirect delay for refined premium user feedback
        setTimeout(() => {
          window.location.href = '/admin-dashboard'; // Fallback path or home matching routing setup
        }, 1500);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Access authorization failed. Please check credentials and try again.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] font-sans flex items-center justify-center p-6 relative selection:bg-[#836822] selection:text-white">
      {/* Absolute top left home link with clean transition hover animations */}
      <div className="absolute top-8 left-8 sm:left-12">
        <a 
          href="/"
          className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-luxury text-[#836822] hover:text-[#5C4716] transition-all group"
        >
          <HiArrowLeft className="transform group-hover:-translate-x-1 transition-transform" size={14} />
          <span>Back to Landing Page</span>
        </a>
      </div>

      {/* Decorative Traditional Border Framing the Container */}
      <div className="absolute inset-0 border-[16px] sm:border-[24px] border-[#F2ECE1] pointer-events-none z-0"></div>

      {}
      <div className="relative z-10 w-full max-w-md bg-white border border-[#C5A880]/30 shadow-2xl p-8 sm:p-10 space-y-8 animate-fadeIn">
        
        {/* Branding Crest Area */}
        <div className="text-center space-y-3">
          <div className="flex flex-col">
            <span className="font-serif text-2xl tracking-luxury text-[#111111] font-medium uppercase">
              Rajyog Suite
            </span>
            <span className="text-[9px] tracking-ultra text-[#836822] font-semibold uppercase -mt-0.5">
              Executive Portal Auth
            </span>
          </div>
          <div className="w-12 h-[1px] bg-[#C5A880]/40 mx-auto"></div>
        </div>

        {/* FEEDBACK STATUS ALERTS */}
        {error && (
          <div className="bg-red-50 text-red-700 text-xs px-4 py-3 border-l-4 border-red-500 font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-xs px-4 py-3 border-l-4 border-green-500 font-medium animate-fadeIn">
            Login authorized successfully! Redirecting to dashboard...
          </div>
        )}

        {}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] tracking-luxury font-semibold uppercase text-[#111111]">
              Manager Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#C5A880]">
                <HiMail size={16} />
              </span>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
                className="w-full pl-10 pr-4 py-3 text-xs bg-[#FAF8F5] border border-[#C5A880]/40 focus:border-[#836822] focus:ring-1 focus:ring-[#836822] focus:outline-none transition-all placeholder-gray-400 font-medium"
                placeholder="e.g. manager@rajyog.com"
              />
            </div>
          </div>

          {/* Secure Password Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] tracking-luxury font-semibold uppercase text-[#111111]">
              Private Access Token
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#C5A880]">
                <HiLockClosed size={16} />
              </span>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
                className="w-full pl-10 pr-4 py-3 text-xs bg-[#FAF8F5] border border-[#C5A880]/40 focus:border-[#836822] focus:ring-1 focus:ring-[#836822] focus:outline-none transition-all placeholder-gray-400 font-medium"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* User Agreement Footnote */}
          <p className="text-[10px] text-[#555555] font-light leading-relaxed text-center">
            By proceeding, you authenticate on a secure corporate gateway. Unauthorised activity is monitored.
          </p>

          {}
          <button 
            type="submit"
            disabled={loading || success}
            className="relative w-full bg-[#836822] hover:bg-[#5C4716] text-white text-xs font-semibold tracking-luxury uppercase py-3.5 transition-all duration-300 flex justify-center items-center shadow-md active:scale-[0.99]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold">Authorising...</span>
              </div>
            ) : (
              <span>Unlock Console</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}