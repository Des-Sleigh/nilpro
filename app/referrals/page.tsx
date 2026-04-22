import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "Referrals — NILPro",
};

export default function Referrals() {
  return (
    <PlaceholderHero
      eyebrow="REFER AND EARN"
      title="Bring a teammate."
      accent="Stack rewards."
      body="One referral = a free month. Three = Pro upgrade. Five = a full year of Pro. Ten = a full year of Champion."
    />
  );
}
