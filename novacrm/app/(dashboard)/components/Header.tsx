'use client';

import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        // Extract first 2 characters before @ symbol, uppercase
        const initials = user.email.split('@')[0].substring(0, 2).toUpperCase();
        setUserInitials(initials);
      }
    }

    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 bg-[#181825] border-b border-[#313244] px-8 py-6 z-100">
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-[500px] relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c7086]" />
          <input
            type="text"
            placeholder="Search contacts, deals..."
            className="
              w-full h-12 pl-12 pr-4
              bg-[#313244] border border-[#45475a]
              rounded-lg
              text-[0.95rem] text-[#cdd6f4]
              placeholder:text-[#6c7086]
              focus:outline-none focus:border-[#F25C05] focus:ring-4 focus:ring-[rgba(242,92,5,0.1)]
              transition-all duration-200
            "
          />
        </div>

        {/* Notifications Icon */}
        <button
          className="
            w-10 h-10
            bg-[#313244]
            rounded-lg
            flex items-center justify-center
            hover:bg-[#45475a] hover:-translate-y-0.5
            transition-all duration-200
          "
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5 text-[#a6adc8]" />
        </button>

        {/* User Avatar */}
        <div
          className="
            w-10 h-10
            rounded-lg
            bg-gradient-to-br from-[#b4befe] to-[#89b4fa]
            flex items-center justify-center
            text-[#1e1e2e] font-bold text-[0.95rem]
          "
        >
          {userInitials || 'U'}
        </div>
      </div>
    </header>
  );
}
