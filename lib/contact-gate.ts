"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Builds a localized redirect target like `/es/propiedades/x?contact=visit`
 * so the login page can send the user back with the right modal re-opened.
 */
export function buildContactNext(
  pathname: string,
  searchParams: { toString(): string },
  contact: string
): string {
  const params = new URLSearchParams(searchParams.toString());
  params.set("contact", contact);
  const qs = params.toString();
  return `${pathname}${qs ? `?${qs}` : ""}`;
}

/**
 * Gate used before opening any contact modal. Returns true only when
 * there is an active session.
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { user } } = await createClient().auth.getUser();
  return !!user;
}