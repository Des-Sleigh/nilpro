import type { Metadata } from "next";
import { ReferralsHero } from "@/components/pages/referrals/ReferralsHero";
import { ReferralLadder } from "@/components/pages/referrals/ReferralLadder";
import { ReferralMechanics } from "@/components/pages/referrals/ReferralMechanics";
import { ReferralsFinalCta } from "@/components/pages/referrals/ReferralsFinalCta";

export const metadata: Metadata = {
  title: "Referrals — NILPro",
};

export default function Referrals() {
  return (
    <main>
      <ReferralsHero />
      <ReferralLadder />
      <ReferralMechanics />
      <ReferralsFinalCta />
    </main>
  );
}
