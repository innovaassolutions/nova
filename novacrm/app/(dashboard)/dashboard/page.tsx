/**
 * Dashboard Page
 *
 * Protected route - requires authentication.
 * Displays user information and provides logout functionality.
 *
 * Features Catppuccin Mocha dark theme with NovaCRM branding.
 *
 * Protection: Middleware redirects unauthenticated users to /login
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Double-check authentication (middleware should handle this)
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-[800px]">
      <h1 className="mb-6 text-3xl font-bold text-[#cdd6f4]">
        Welcome to NovaCRM
      </h1>

      <div className="mb-6 rounded-lg border border-[#313244] bg-[#181825] p-6">
        <p className="mb-2 text-sm font-semibold text-[#a6adc8]">
          Authenticated User
        </p>
        <p className="text-base text-[#cdd6f4]">{user.email}</p>
        <p className="mt-2 text-xs text-[#6c7086]">ID: {user.id}</p>
      </div>

      <div className="mb-6 rounded-lg border border-[#89b4fa]/20 bg-[#89b4fa]/10 p-4">
        <p className="text-sm text-[#cdd6f4]">
          ✓ Authentication is working correctly
        </p>
        <p className="mt-1 text-xs text-[#a6adc8]">
          Session tokens are stored in httpOnly cookies
        </p>
      </div>

      <LogoutButton />
    </div>
  );
}
