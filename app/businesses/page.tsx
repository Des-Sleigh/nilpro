import type { Metadata } from "next";
import { BusinessesHero } from "@/components/pages/businesses/BusinessesHero";
import { BusinessesContent } from "@/components/pages/businesses/BusinessesContent";

export const metadata: Metadata = {
  title: "Businesses — NILPro",
};

export default function Businesses() {
  return (
    <main>
      <BusinessesHero />
      <BusinessesContent />
    </main>
  );
}
