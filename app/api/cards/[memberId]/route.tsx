/**
 * GET /api/cards/{memberId}?format=story|post
 *
 * Renders the Verified Athlete Card for the given member as a PNG.
 * Public route — the card is shareable by design.
 */

import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import * as Sentry from "@sentry/nextjs";
import { CardTemplate, type CardFormat } from "@/lib/cards/template";
import { getCardFonts } from "@/lib/cards/fonts";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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

export async function GET(
  request: Request,
  context: { params: Promise<{ memberId: string }> }
) {
  // Outer try/catch so a font/render/db failure surfaces the cause to
  // Sentry + Vercel logs instead of a bare 500. The previous version
  // had no error boundary and any throw bubbled as an opaque 500.
  try {
    const { memberId } = await context.params;
    const url = new URL(request.url);
    const formatParam = url.searchParams.get("format");
    const format: CardFormat = formatParam === "post" ? "post" : "story";

    // Validate memberId — only digits, 5+ chars
    if (!/^\d{5,}$/.test(memberId)) {
      return new Response("Invalid member id", { status: 400 });
    }

    // Pull profile data via the security-definer function.
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .rpc("get_public_athlete_profile", { p_member_id: memberId })
      .maybeSingle();

    if (error) {
      console.error(`[api/cards] db error for ${memberId}:`, error.message);
      Sentry.captureException(error, { tags: { route: "api/cards", memberId } });
      return new Response("Card lookup failed", { status: 500 });
    }
    if (!data) {
      return new Response("Card not found", { status: 404 });
    }
    const row = data as ProfileRow;

    // Generate QR pointing to the public profile page.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thenilpro.com";
    const profileUrl = `${baseUrl}/a/${memberId}`;
    let qrDataUrl: string;
    try {
      qrDataUrl = await QRCode.toDataURL(profileUrl, {
        margin: 0,
        width: 440,
        color: { dark: "#07090f", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
    } catch (e) {
      console.error(`[api/cards] qr error:`, e);
      Sentry.captureException(e, { tags: { route: "api/cards", step: "qr" } });
      return new Response("QR generation failed", { status: 500 });
    }

    // Load fonts. Fall back to a no-fonts render if Google Fonts is
    // unreachable rather than crashing the whole route.
    let fonts: Awaited<ReturnType<typeof getCardFonts>> = [];
    try {
      fonts = await getCardFonts();
    } catch (e) {
      console.error(`[api/cards] font-load error:`, e);
      Sentry.captureException(e, { tags: { route: "api/cards", step: "fonts" } });
      // Don't fail — Satori without fonts will use whatever default it can
      // (which may render boxes for text, but the card still emits).
    }

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
          "Cache-Control":
            "public, max-age=60, s-maxage=60, stale-while-revalidate=600",
          "Content-Disposition": `inline; filename="nilpro-${memberId}-${format}.png"`,
        },
      }
    );
  } catch (e) {
    console.error(`[api/cards] unhandled error:`, e);
    Sentry.captureException(e, { tags: { route: "api/cards", step: "render" } });
    return new Response(
      `Card render failed: ${e instanceof Error ? e.message : "unknown"}`,
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
}
