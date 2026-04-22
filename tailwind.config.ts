import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#07090f",
        "bg-soft": "#0d1118",
        "bg-elev": "#141923",
        "bg-card": "#181e2a",
        border: "#242c3d",
        "border-strong": "#2e3852",
        green: {
          DEFAULT: "#00e676",
          hot: "#00ff88",
        },
        gold: "#ffb800",
        red: "#ff3a57",
        blue: "#3a8dff",
        text: {
          DEFAULT: "#ffffff",
          dim: "#aeb8cc",
          muted: "#6a7690",
          faint: "#4a546a",
        },
      },
      boxShadow: {
        "green-glow": "0 0 24px rgba(0, 230, 118, 0.35)",
        chunky: "0 4px 0 0 #000",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        cond: ["var(--font-barlow-cond)", "Oswald", "sans-serif"],
        body: ["var(--font-barlow)", "-apple-system", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Courier New", "monospace"],
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
export default config;
