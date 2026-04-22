import type { Metadata } from "next";
import { PricingHero } from "@/components/pages/pricing/PricingHero";
import { PricingTiers } from "@/components/pages/pricing/PricingTiers";
import { PricingFinalCta } from "@/components/pages/pricing/PricingFinalCta";

export const metadata: Metadata = {
  title: "Pricing — NILPro",
};

export default function Pricing() {
  return (
    <main>
      <PricingHero />
      <PricingTiers />
      <PricingFinalCta />
    </main>
  );
}
