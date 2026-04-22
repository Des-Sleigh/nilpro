import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase redirects here after:
 * - email signup confirmation
 * - magic-link email
 * - OAuth sign-in (once enabled)
 *
 * We exchange the `code` for a session, which sets the auth cookies,
 * then forward the user to `next` (defaulting to /dashboard).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${origin}/signin?error=${encodeURIComponent("Missing confirmation code.")}`
  );
}
