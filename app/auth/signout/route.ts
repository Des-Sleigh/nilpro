import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign the user out. POST-only so it can't be triggered by a stray
 * link-prefetch or CSRF vector.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
