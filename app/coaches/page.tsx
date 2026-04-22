import type { Metadata } from "next";
import { CoachesHero } from "@/components/pages/coaches/CoachesHero";
import { CoachesContent } from "@/components/pages/coaches/CoachesContent";

export const metadata: Metadata = {
  title: "Coaches — NILPro",
};

export default function Coaches() {
  return (
    <main>
      <CoachesHero />
      <CoachesContent />
    </main>
  );
}
