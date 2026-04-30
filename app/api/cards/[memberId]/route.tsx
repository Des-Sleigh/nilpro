/**
 * GET /api/cards/{memberId}?format=story|post
 *
 * Renders the Verified Athlete Card for the given member as a PNG.
 * Public route — the card is shareable by design.
 *
 * Caches at the edge for 1 hour. Athletes who change their photo will see
 * the new card surface within the cache TTL; if you need instant invalidation
 * we can add a `?v={timestamp}` cachebuster from the client.
 */

import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { CardTemplate, type CardFormat } from "@/lib/cards/template";
import { getCardFonts } from "@/lib/cards/fonts";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
// next/og runs fine on Node; Edge would be faster but the @supabase/admin
// client uses Node APIs (fetch is fine, but service-role auth uses Node crypto).

export async function GET(
  request: Request,
  context: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await context.params;
  const url = new URL(request.url);
  const formatParam = url.searchParams.get("format");
  const format: CardFormat = formatParam === "post" ? "post" : "story";

  // Validate memberId — only digits, 5+ chars
  if (!/^\d{5,}$/.test(memberId)) {
    return new Response("Invalid member id", { status: 400 });
  }

  // Pull profile data via the security-definer function (limited fields,
  // safe to expose publicly). Using admin client to call the function so
  // RLS doesn't get in the way for the unauthenticated public profile.
  type ProfileRow = {
    member_id: string;
    first_name: string;
    last_name: string;
    sport: string;
    position: string | null;
    level: string;
    school: string;
    graduation_year: number | null;
    hometown_state: string | null;
    profile_photo_url: string | null;
    member_year: number;
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .rpc("get_public_athlete_profile", { p_member_id: memberId })
    .maybeSingle();

  if (error || !data) {
    return new Response("Card not found", { status: 404 });
  }
  const row = data as ProfileRow;

  // Generate QR pointing to the public profile page.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thenilpro.com";
  const profileUrl = `${baseUrl}/a/${memberId}`;
  const qrDataUrl = await QRCode.toDataURL(profileUrl, {
    margin: 0,
    width: 440,
    color: { dark: "#07090f", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  const fonts = await getCardFonts();

  const dim =
    format === "story"
      ? { width: 1080, height: 1920 }
      : { width: 1080, height: 1350 };

  return new ImageResponse(
    (
      <CardTemplate
        format={format}
        data={{
          memberId,
          firstName: row.first_name,
          lastName: row.last_name,
          school: row.school,
          sport: row.sport,
          position: row.position,
          graduationYear: row.graduation_year,
          hometownState: row.hometown_state,
          level: row.level,
          profilePhotoUrl: row.profile_photo_url,
          memberYear: row.member_year,
          qrDataUrl,
          publicProfileUrl: profileUrl.replace(/^https?:\/\//, ""),
        }}
      />
    ),
    {
      width: dim.width,
      height: dim.height,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: f.style,
      })),
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Disposition": `inline; filename="nilpro-${memberId}-${format}.png"`,
      },
    }
  );
}
