import type { Metadata } from "next";
import { Bebas_Neue, Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TickerBar } from "@/components/TickerBar";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PostHogTracker } from "@/components/providers/PostHogTracker";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCond = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-barlow-cond",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NILPro — Local NIL deals for every high school + college athlete",
  description:
    "NILPro pitches local businesses on your behalf — so every high school and college athlete can land real hometown deals. Free meals, gear, cash for posts, and more. Free to sign up. Zero commission.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = Boolean(user);

  return (
    <html
      lang="en"
      className={`${bebas.variable} ${barlow.variable} ${barlowCond.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased">
        <PostHogTracker />
        <RevealOnScroll />
        <TickerBar />
        <Nav isSignedIn={isSignedIn} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
