import { Hero } from "@/components/home/Hero";
import { AudienceMarquee } from "@/components/home/AudienceMarquee";
import { FourPlays } from "@/components/home/FourPlays";
import { DealTypes } from "@/components/home/DealTypes";
import { YourCall } from "@/components/home/YourCall";
import { EligibilityPlaceholder } from "@/components/home/EligibilityPlaceholder";
import { PlayByPlay } from "@/components/home/PlayByPlay";
import { Quote } from "@/components/home/Quote";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { FaqTeaser } from "@/components/home/FaqTeaser";
import { FinalCta } from "@/components/home/FinalCta";

export default function Home() {
  return (
    <main>
      <Hero />
      <AudienceMarquee />
      <FourPlays />
      <DealTypes />
      <YourCall />
      <EligibilityPlaceholder />
      <PlayByPlay />
      <Quote />
      <PricingTeaser />
      <FaqTeaser />
      <FinalCta />
    </main>
  );
}
