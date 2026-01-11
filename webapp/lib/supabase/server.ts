/**
 * Supabase Server Client for Server-Side Operations
 *
 * This file provides Supabase clients for use in Server Components, Server Actions,
 * and Route Handlers. It uses the @supabase/ssr package for proper cookie handling
 * in the Next.js App Router.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

/**
 * Creates a Supabase client for Server Components and Server Actions
 *
 * This client properly handles cookies for authentication in server-side contexts.
 * It should be used in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 *
 * @returns Supabase client instance typed with our database schema
 *
 * @example
 * ```typescript
 * // In a Server Component
 * export default async function Page() {
 *   const supabase = createClient();
 *   const { data: user } = await supabase.auth.getUser();
 *   return <div>Hello {user?.email}</div>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // In a Server Action
 * 'use server';
 * export async function createGroup(formData: FormData) {
 *   const supabase = createClient();
 *   const { data, error } = await supabase.from('groups').insert({ ... });
 *   return { data, error };
 * }
 * ```
 */
export async function createClient() {
  // Get the cookies store
  const cookieStore = await cookies();

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  // Create and return the server client with proper cookie handling
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        // Get all cookies
        getAll() {
          return cookieStore.getAll();
        },
        // Set a cookie
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: unknown }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as never);
            });
          } catch (_error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for Middleware
 *
 * This client is specifically designed for use in Next.js middleware.
 * It handles cookie operations in the middleware context where the cookies API differs.
 *
 * @param request - The Next.js request object
 * @returns Object containing the Supabase client and response
 *
 * @example
 * ```typescript
 * // In middleware.ts
 * import { createMiddlewareClient } from '@/lib/supabase/server';
 * import { NextResponse } from 'next/server';
 *
 * export async function middleware(request: NextRequest) {
 *   const { supabase, response } = createMiddlewareClient(request);
 *   await supabase.auth.getSession();
 *   return response;
 * }
 * ```
 */
export function createMiddlewareClient(request: Request) {
  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  // Create the server client with middleware-specific cookie handling
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.headers.get('cookie')
            ?.split(';')
            .map(cookie => {
              const [name, ...rest] = cookie.trim().split('=');
              return { name, value: rest.join('=') };
            }) ?? [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.headers.append('cookie', `${name}=${value}`);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response };
}

// Import NextResponse for middleware client
import { NextResponse } from 'next/server';
