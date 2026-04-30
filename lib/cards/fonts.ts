/**
 * Font loading for the Verified Athlete Card image generation pipeline.
 * next/og's ImageResponse needs font data as ArrayBuffer; we fetch from
 * Google Fonts CSS, parse the woff2/ttf URL, fetch that, return.
 *
 * In-memory cache prevents re-fetching on every request (Vercel keeps
 * the module instance warm between invocations on the same edge node).
 */

type FontEntry = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800;
  style: "normal" | "italic";
};

const FONT_CACHE = new Map<string, ArrayBuffer>();

async function loadGoogleFont(
  family: string,
  weight: 400 | 500 | 600 | 700 | 800
): Promise<ArrayBuffer> {
  const cacheKey = `${family}:${weight}`;
  const cached = FONT_CACHE.get(cacheKey);
  if (cached) return cached;

  const url = `https://fonts.googleapis.com/css2?family=${family.replace(
    /\s+/g,
    "+"
  )}:wght@${weight}&display=swap`;

  // Google Fonts serves different formats based on User-Agent.
  // Without a UA hint it returns woff2; we want truetype for Satori reliability.
  const css = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  }).then((r) => r.text());

  // Try multiple formats in order of preference.
  const match =
    css.match(/src: url\((.+?)\) format\('truetype'\)/) ||
    css.match(/src: url\((.+?)\) format\('woff2'\)/) ||
    css.match(/src: url\((.+?)\)/);
  if (!match) throw new Error(`Could not locate font URL for ${family} ${weight}`);

  const fontUrl = match[1];
  const buf = await fetch(fontUrl).then((r) => r.arrayBuffer());
  FONT_CACHE.set(cacheKey, buf);
  return buf;
}

export async function getCardFonts(): Promise<FontEntry[]> {
  const [bebas, barlowBold, barlowMedium, barlowRegular, jetbrainsBold] =
    await Promise.all([
      loadGoogleFont("Bebas Neue", 400),
      loadGoogleFont("Barlow", 700),
      loadGoogleFont("Barlow", 500),
      loadGoogleFont("Barlow", 400),
      loadGoogleFont("JetBrains Mono", 700),
    ]);

  return [
    { name: "Bebas Neue", data: bebas, weight: 400, style: "normal" },
    { name: "Barlow", data: barlowBold, weight: 700, style: "normal" },
    { name: "Barlow", data: barlowMedium, weight: 500, style: "normal" },
    { name: "Barlow", data: barlowRegular, weight: 400, style: "normal" },
    { name: "JetBrains Mono", data: jetbrainsBold, weight: 700, style: "normal" },
  ];
}
