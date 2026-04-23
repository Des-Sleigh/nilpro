import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "Your target list — NILPro",
};

export default function TargetListPage() {
  return (
    <PlaceholderHero
      eyebrow="TARGET LIST"
      title="Your full list lives here —"
      accent="coming in the next build."
      body="Review every business we've lined up for outreach, toggle pitches on or off, and dig into why each one made the list. Shipping with the next dashboard drop."
    />
  );
}
