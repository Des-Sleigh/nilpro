import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign the user out. POST-only so it can't be triggered by a stray
 * link-prefetch. Origin is also checked: a cross-origin form POST
 * (the residual CSRF vector for "simple" requests) is rejected, so an
 * attacker can't force-sign-out NILPro users from a malicious page.
 */
export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const requestOrigin = requestUrl.origin;
  const senderOrigin =
    request.headers.get("origin") || request.headers.get("referer") || "";

  // Allow sign-out from same-origin only. Empty Origin header (rare) is
  // treated as suspect — the standard browser behavior is to send Origin
  // for POSTs.
  if (!senderOrigin || !senderOrigin.startsWith(requestOrigin)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(`${requestOrigin}/`, { status: 303 });
}
