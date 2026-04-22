import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "Businesses — NILPro",
};

export default function Businesses() {
  return (
    <PlaceholderHero
      eyebrow="FOR LOCAL BUSINESSES"
      title="Got an email from"
      accent="an NILPro athlete?"
      body="What NILPro is, how deals work, what you're agreeing to, and how to say yes, counter, or no."
    />
  );
}
