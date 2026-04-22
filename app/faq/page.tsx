import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "FAQ — NILPro",
};

export default function FAQ() {
  return (
    <PlaceholderHero
      eyebrow="COMMON QUESTIONS"
      title="Everything you"
      accent="might be wondering."
      body="Signup, verification, fees, deals, taxes, compliance, minors, school rules — the full list."
    />
  );
}
