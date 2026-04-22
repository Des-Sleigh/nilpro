import type { Metadata } from "next";
import { HowHero } from "@/components/pages/how-it-works/HowHero";
import { StepByStep } from "@/components/pages/how-it-works/StepByStep";

export const metadata: Metadata = {
  title: "How it works — NILPro",
};

export default function HowItWorks() {
  return (
    <main>
      <HowHero />
      <StepByStep />
    </main>
  );
}
