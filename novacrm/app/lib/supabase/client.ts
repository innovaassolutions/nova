/**
 * Supabase Browser Client
 *
 * This client is used for client-side operations in React components.
 * It automatically manages authentication state and session persistence
 * using browser cookies.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { createClient } from '@/app/lib/supabase/client';
 *
 * export default function ContactsPage() {
 *   const supabase = createClient();
 *
 *   const fetchContacts = async () => {
 *     const { data, error } = await supabase
 *       .from('contacts')
 *       .select('*')
 *       .order('created_at', { ascending: false });
 *   };
 * }
 * ```
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
