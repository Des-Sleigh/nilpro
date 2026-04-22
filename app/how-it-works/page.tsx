import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "How it works — NILPro",
};

export default function HowItWorks() {
  return (
    <PlaceholderHero
      eyebrow="THE LINEUP"
      title="Four plays."
      accent="You run all of them."
      body="We don't blast emails on day one. Every move is gated by your approval. If anything doesn't feel right, nothing sends."
    />
  );
}
