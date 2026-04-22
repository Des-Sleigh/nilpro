import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "Pricing — NILPro",
};

export default function Pricing() {
  return (
    <PlaceholderHero
      eyebrow="PRICING"
      title="$19 a year."
      accent="Zero commission."
      body="Three tiers. Flat annual pricing. No cut of any deal you sign. Pick the tier that fits how hard you want to go."
    />
  );
}
