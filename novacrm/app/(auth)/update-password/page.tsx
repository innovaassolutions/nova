'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/app/components/ui/Toast';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    // Check if user has a valid session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Invalid or expired reset link', 'error');
        router.push('/login');
      }
    };
    checkSession();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        showToast(error.message || 'Failed to update password', 'error');
        setLoading(false);
        return;
      }

      showToast('Password updated successfully!', 'success');

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e1e2e]">
      <div
        className="w-full max-w-[400px] rounded-2xl border border-[#313244] bg-[#181825] p-8"
        style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
      >
        <div className="mb-8 flex justify-center">
          <Image
            src="/nova-crm-logo.svg"
            alt="NovaCRM"
            width={200}
            height={60}
            priority
          />
        </div>

        <h1 className="mb-6 text-center text-2xl font-bold text-[#cdd6f4]">
          Set New Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#a6adc8]"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              className="w-full rounded-[10px] border border-[#45475a] bg-[#313244] px-3 py-3 text-base text-[#cdd6f4] transition-all duration-200 placeholder:text-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-[3px] focus:ring-[#F25C05]/10"
              placeholder="Enter new password"
              disabled={loading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-[#f38ba8]">{errors.password}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-[#a6adc8]"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              className="w-full rounded-[10px] border border-[#45475a] bg-[#313244] px-3 py-3 text-base text-[#cdd6f4] transition-all duration-200 placeholder:text-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-[3px] focus:ring-[#F25C05]/10"
              placeholder="Confirm new password"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-[#f38ba8]">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] bg-[#F25C05] px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-[#D94C04] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(242,92,5,0.3)] focus:outline-none focus:ring-[3px] focus:ring-[#F25C05]/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
