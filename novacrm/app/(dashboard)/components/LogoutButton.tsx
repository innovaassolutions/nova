'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/client';

interface LogoutButtonProps {
  isCollapsed?: boolean;
}

export default function LogoutButton({ isCollapsed = false }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh(); // CRITICAL: Force reload to clear cached data
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      title={isCollapsed ? 'Log Out' : undefined}
      className={`
        w-full flex items-center
        py-2.5
        bg-[#313244] border border-[#45475a]
        rounded-lg
        text-[#a6adc8] text-[0.95rem] font-medium
        hover:bg-[#45475a] hover:text-[#cdd6f4] hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out
        ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'}
      `}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-[#F25C05] border-t-transparent rounded-full animate-spin" />
      ) : (
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
      )}
      {!isCollapsed && (
        <span>{isLoading ? 'Logging out...' : 'Log Out'}</span>
      )}
    </button>
  );
}
