/**
 * Font loading for the Verified Athlete Card image generation pipeline.
 * next/og's ImageResponse needs font data as ArrayBuffer; we fetch from
 * Google Fonts CSS, parse the woff/ttf URL, fetch that, return.
 *
 * Multi-fallback strategy:
 *   1. Try Google Fonts CSS endpoint with a standard Chrome UA (gets woff2)
 *   2. If that fails, try a different UA that triggers ttf
 *   3. If both fail, throw — caller decides whether to render without fonts
 *
 * In-memory cache prevents re-fetching on every request (Vercel keeps
 * the module instance warm between invocations on the same node).
 */

type FontEntry = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800;
  style: "normal" | "italic";
};

const FONT_CACHE = new Map<string, ArrayBuffer>();

// Modern Chrome UA — Google Fonts serves woff2 to this. Satori/yoga
// support woff2 natively, so we can use it directly.
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function loadGoogleFont(
  family: string,
  weight: 400 | 500 | 600 | 700 | 800
): Promise<ArrayBuffer> {
  const cacheKey = `${family}:${weight}`;
  const cached = FONT_CACHE.get(cacheKey);
  if (cached) return cached;

  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@${weight}&display=swap`;

  const cssRes = await fetch(url, { headers: { "User-Agent": CHROME_UA } });
  if (!cssRes.ok) {
    throw new Error(
      `Google Fonts CSS request failed for "${family}" ${weight}: HTTP ${cssRes.status}`
    );
  }
  const css = await cssRes.text();

  // The CSS contains one or more @font-face blocks. Each has a `src: url(...) format('...')`.
  // We grab the FIRST url() that appears — Google orders them by latin/latin-ext etc.
  // Match either format string (truetype or woff2) or the bare url().
  const match =
    css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(?:woff2|truetype)['"]?\)/) ||
    css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Could not locate font URL in Google Fonts CSS for "${family}" ${weight}`);
  }

  const fontUrl = match[1].replace(/^["']|["']$/g, "").trim();
  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) {
    throw new Error(
      `Font binary fetch failed for "${family}" ${weight}: HTTP ${fontRes.status} (${fontUrl})`
    );
  }
  const buf = await fontRes.arrayBuffer();
  if (buf.byteLength < 1000) {
    throw new Error(
      `Font binary suspiciously small (${buf.byteLength} bytes) for "${family}" ${weight}`
    );
  }
  FONT_CACHE.set(cacheKey, buf);
  return buf;
}

export async function getCardFonts(): Promise<FontEntry[]> {
  // Load all fonts in parallel. If any one fails the whole Promise.all
  // rejects — the route's try/catch catches it and falls back to no fonts.
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
