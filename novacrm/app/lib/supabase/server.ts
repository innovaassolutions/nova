/**
 * Supabase Server Client
 *
 * This client is used for server-side operations in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 * - Middleware
 *
 * It implements cookie-based session management for SSR authentication,
 * ensuring users remain authenticated across page loads.
 *
 * @example Server Component
 * ```tsx
 * import { createClient } from '@/app/lib/supabase/server';
 *
 * export default async function ContactsPage() {
 *   const supabase = await createClient();
 *
 *   const { data: contacts } = await supabase
 *     .from('contacts')
 *     .select('*')
 *     .order('created_at', { ascending: false });
 *
 *   return <ContactsList contacts={contacts} />;
 * }
 * ```
 *
 * @example Server Action
 * ```tsx
 * 'use server';
 *
 * import { createClient } from '@/app/lib/supabase/server';
 *
 * export async function createContact(formData: FormData) {
 *   const supabase = await createClient();
 *
 *   const { data, error } = await supabase
 *     .from('contacts')
 *     .insert({
 *       first_name: formData.get('first_name'),
 *       last_name: formData.get('last_name'),
 *       linkedin_url: formData.get('linkedin_url'),
 *     });
 *
 *   return { data, error };
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
