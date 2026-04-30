/**
 * Card template — JSX rendered server-side via next/og's ImageResponse.
 *
 * Constraints (Satori subset):
 * - Inline styles only (no Tailwind classes — Satori's Tailwind support is
 *   incomplete enough that explicit styles are safer)
 * - Every container needs `display: "flex"` (Satori default is block but
 *   block layout is buggy)
 * - Images via absolute HTTPS URL or data: URL only
 * - No background-image gradients on text; use solid backgrounds + colored text
 *
 * Two formats:
 * - story: 1080×1920 (9:16, IG Story / TikTok)
 * - post:  1080×1350 (4:5,  IG feed)
 */

export type CardFormat = "story" | "post";

export type CardData = {
  memberId: string;          // "01842"
  firstName: string;
  lastName: string;
  school: string;
  sport: string;
  position?: string | null;
  graduationYear: number | null;
  hometownState?: string | null;
  level: string;             // "HS", "D1", etc.
  profilePhotoUrl?: string | null;
  memberYear: number;        // year they joined, e.g. 2026
  qrDataUrl: string;         // pre-generated QR code as data: URL
  publicProfileUrl: string;  // e.g. "thenilpro.com/a/01842"
};

const COLOR = {
  bg: "#07090f",
  bgSoft: "#0d1118",
  bgCard: "#181e2a",
  border: "#242c3d",
  green: "#00e676",
  greenDim: "rgba(0,230,118,0.18)",
  text: "#ffffff",
  textDim: "#aeb8cc",
  textMuted: "#6a7690",
  gold: "#ffb800",
};

function dimensionsFor(format: CardFormat) {
  return format === "story"
    ? { width: 1080, height: 1920 }
    : { width: 1080, height: 1350 };
}

function initialsFor(first: string, last: string): string {
  const f = (first?.[0] ?? "").toUpperCase();
  const l = (last?.[0] ?? "").toUpperCase();
  return `${f}${l}` || "NL";
}

/** The actual JSX returned to ImageResponse. */
export function CardTemplate({
  format,
  data,
}: {
  format: CardFormat;
  data: CardData;
}) {
  const dim = dimensionsFor(format);
  // Story is taller, so we give the photo more vertical space.
  const photoHeight = format === "story" ? 980 : 700;
  const nameSize = format === "story" ? 132 : 110;
  const subSize = format === "story" ? 36 : 32;

  const initials = initialsFor(data.firstName, data.lastName);
  const sportLine = data.position ? `${data.sport} • ${data.position}` : data.sport;
  const classLine = data.graduationYear ? `Class of ${data.graduationYear}` : data.level;
  const homeLine = data.hometownState ? data.hometownState : "United States";

  return (
    <div
      style={{
        width: dim.width,
        height: dim.height,
        background: COLOR.bg,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "Barlow",
      }}
    >
      {/* Top: photo or initials */}
      <div
        style={{
          width: "100%",
          height: photoHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: data.profilePhotoUrl ? COLOR.bg : COLOR.bgSoft,
          position: "relative",
          overflow: "hidden",
          borderBottom: `2px solid ${COLOR.green}`,
        }}
      >
        {data.profilePhotoUrl ? (
          <img
            src={data.profilePhotoUrl}
            alt=""
            width={dim.width}
            height={photoHeight}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        ) : (
          <div
            style={{
              width: 320,
              height: 320,
              borderRadius: 999,
              background: COLOR.greenDim,
              border: `4px solid ${COLOR.green}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Bebas Neue",
              fontSize: 200,
              color: COLOR.green,
              letterSpacing: "0.02em",
            }}
          >
            {initials}
          </div>
        )}

        {/* Verified badge — top right corner */}
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 36,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: COLOR.green,
            padding: "12px 22px",
            borderRadius: 999,
            fontFamily: "JetBrains Mono",
            fontSize: 22,
            fontWeight: 700,
            color: COLOR.bg,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ display: "flex" }}>✓</span>
          <span style={{ display: "flex" }}>VERIFIED</span>
        </div>

        {/* NILPro logo / wordmark — top left corner */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 36,
            display: "flex",
            flexDirection: "column",
            background: "rgba(7,9,15,0.78)",
            padding: "10px 18px",
            borderRadius: 8,
            border: `1px solid ${COLOR.border}`,
          }}
        >
          <span
            style={{
              fontFamily: "Bebas Neue",
              fontSize: 38,
              color: COLOR.text,
              letterSpacing: "0.04em",
              lineHeight: 1,
              display: "flex",
            }}
          >
            NIL<span style={{ color: COLOR.green, display: "flex" }}>PRO</span>
          </span>
          <span
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 11,
              color: COLOR.textMuted,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginTop: 2,
              display: "flex",
            }}
          >
            VERIFIED ATHLETE
          </span>
        </div>
      </div>

      {/* Bottom block — name + meta + QR */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          padding: "48px 56px 56px 56px",
          alignItems: "stretch",
        }}
      >
        {/* Left: name + meta */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "space-between",
            paddingRight: 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Bebas Neue",
                fontSize: nameSize,
                color: COLOR.text,
                letterSpacing: "0.02em",
                lineHeight: 0.95,
                display: "flex",
              }}
            >
              {data.firstName.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: "Bebas Neue",
                fontSize: nameSize,
                color: COLOR.green,
                letterSpacing: "0.02em",
                lineHeight: 0.95,
                marginTop: 4,
                display: "flex",
              }}
            >
              {data.lastName.toUpperCase()}
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "Barlow",
                  fontSize: subSize,
                  fontWeight: 700,
                  color: COLOR.text,
                  display: "flex",
                }}
              >
                {data.school}
              </span>
              <span
                style={{
                  fontFamily: "Barlow",
                  fontSize: subSize - 4,
                  fontWeight: 500,
                  color: COLOR.textDim,
                  display: "flex",
                }}
              >
                {sportLine}
              </span>
              <span
                style={{
                  fontFamily: "Barlow",
                  fontSize: subSize - 6,
                  fontWeight: 400,
                  color: COLOR.textMuted,
                  display: "flex",
                }}
              >
                {classLine} · {homeLine}
              </span>
            </div>
          </div>

          {/* Tagline lock-up */}
          <div
            style={{
              fontFamily: "Bebas Neue",
              fontSize: format === "story" ? 36 : 30,
              color: COLOR.green,
              letterSpacing: "0.16em",
              marginTop: 32,
              display: "flex",
            }}
          >
            YOUR HOMETOWN. YOUR DEALS.
          </div>
        </div>

        {/* Right: QR + ID */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            minWidth: 240,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 18,
                color: COLOR.textMuted,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                display: "flex",
                marginBottom: 6,
              }}
            >
              MEMBER ID
            </span>
            <span
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 56,
                fontWeight: 700,
                color: COLOR.text,
                letterSpacing: "0.06em",
                display: "flex",
                lineHeight: 1,
              }}
            >
              {data.memberId}
            </span>
            <span
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 16,
                color: COLOR.textMuted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 12,
                display: "flex",
              }}
            >
              {data.memberYear} MEMBER
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <img
              src={data.qrDataUrl}
              alt=""
              width={220}
              height={220}
              style={{
                width: 220,
                height: 220,
                background: COLOR.text,
                padding: 12,
                borderRadius: 12,
              }}
            />
            <span
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 16,
                color: COLOR.textDim,
                marginTop: 12,
                letterSpacing: "0.04em",
                display: "flex",
              }}
            >
              {data.publicProfileUrl}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
