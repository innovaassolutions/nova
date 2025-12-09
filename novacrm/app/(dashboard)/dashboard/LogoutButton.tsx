'use client';

/**
 * Logout Button Component
 *
 * Handles user sign-out and redirects to login page.
 * Features Catppuccin Mocha dark theme with orange branding.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/app/components/ui/Toast';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        showToast('Failed to sign out. Please try again.', 'error');
        setLoading(false);
        return;
      }

      // Success - redirect to login
      router.push('/login');
      router.refresh();
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full max-w-[200px] rounded-[10px] border-2 border-[#f38ba8] bg-transparent px-4 py-3 text-base font-semibold text-[#f38ba8] transition-all duration-200 hover:bg-[#f38ba8] hover:text-[#1e1e2e] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(243,139,168,0.3)] focus:outline-none focus:ring-[3px] focus:ring-[#f38ba8]/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-[#f38ba8] disabled:hover:shadow-none"
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
