'use client';

/**
 * Login Page
 *
 * Provides email/password authentication for INNOVAAS team members.
 * Features Catppuccin Mocha dark theme with NovaCRM branding.
 *
 * Authentication Flow:
 * 1. User enters email/password
 * 2. Client-side validation
 * 3. Supabase Auth signInWithPassword
 * 4. JWT tokens stored in httpOnly cookies via @supabase/ssr
 * 5. Redirect to /dashboard on success
 *
 * Design: Catppuccin Mocha color palette with Innovaas Orange (#F25C05)
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/app/lib/supabase/client';
import { showToast } from '@/app/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Show authentication error via toast
        showToast(error.message || 'Invalid email or password', 'error');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Success - redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      // Network or unexpected errors
      showToast(
        'Network error. Please check your connection and try again.',
        'error'
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e1e2e]">
      {/* Login Card */}
      <div
        className="w-full max-w-[400px] rounded-2xl border border-[#313244] bg-[#181825] p-8"
        style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/nova-crm-logo.svg"
            alt="NovaCRM"
            width={200}
            height={60}
            priority
          />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#a6adc8]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear email error when user types
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              className="w-full rounded-[10px] border border-[#45475a] bg-[#313244] px-3 py-3 text-base text-[#cdd6f4] transition-all duration-200 placeholder:text-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-[3px] focus:ring-[#F25C05]/10"
              placeholder="you@innovaas.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[#f38ba8]">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#a6adc8]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Clear password error when user types
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              className="w-full rounded-[10px] border border-[#45475a] bg-[#313244] px-3 py-3 text-base text-[#cdd6f4] transition-all duration-200 placeholder:text-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-[3px] focus:ring-[#F25C05]/10"
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-[#f38ba8]">{errors.password}</p>
            )}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] bg-[#F25C05] px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-[#D94C04] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(242,92,5,0.3)] focus:outline-none focus:ring-[3px] focus:ring-[#F25C05]/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
