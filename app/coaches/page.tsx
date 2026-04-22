import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "Coaches — NILPro",
};

export default function Coaches() {
  return (
    <PlaceholderHero
      eyebrow="FOR COACHES"
      title="Help your athletes"
      accent="land real deals."
      body="Why coaches use NILPro, the compliance guardrails, team rates, and how we stay out of your way."
    />
  );
}
