import { Hero } from "@/components/home/Hero";
import { AudienceMarquee } from "@/components/home/AudienceMarquee";
import { FourPlays } from "@/components/home/FourPlays";
import { DealTypes } from "@/components/home/DealTypes";
import { YourCall } from "@/components/home/YourCall";
import { NilMap } from "@/components/home/NilMap";
import { PlayByPlay } from "@/components/home/PlayByPlay";
import { Quote } from "@/components/home/Quote";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { FaqTeaser } from "@/components/home/FaqTeaser";
import { FinalCta } from "@/components/home/FinalCta";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = Boolean(user);

  return (
    <main>
      <Hero isSignedIn={isSignedIn} />
      <AudienceMarquee />
      <FourPlays />
      <DealTypes />
      <YourCall />
      <NilMap />
      <PlayByPlay />
      <Quote />
      <PricingTeaser />
      <FaqTeaser />
      <FinalCta isSignedIn={isSignedIn} />
    </main>
  );
}
