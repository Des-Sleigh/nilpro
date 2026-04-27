import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Single landing pad for every auth email.
 *
 * Two flows hit this route:
 *
 * 1. Email-OTP flow (signup confirm, password recovery, magic link, email
 *    change) — Supabase email templates point at us with `?token_hash=…&
 *    type=recovery|signup|magiclink|email_change` query params. We call
 *    verifyOtp to materialize a session.
 *
 * 2. Code-exchange flow (OAuth providers, server-side magic links) — the
 *    URL has `?code=…`. We call exchangeCodeForSession.
 *
 * Both honor a `?next=/some/path` redirect; default after success is the
 * dashboard, except for password recovery where we send the athlete to
 * /update-password so they can set a new one.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const explicitNext = searchParams.get("next");

  // Pick a sensible landing page if `next` wasn't passed.
  const fallbackNext =
    type === "recovery" ? "/update-password" : "/dashboard";
  const next = explicitNext ?? fallbackNext;

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(error.message)}`
    );
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${origin}/signin?error=${encodeURIComponent(
      "That auth link is missing a token. Try requesting a new one."
    )}`
  );
}
