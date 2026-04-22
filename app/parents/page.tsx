import type { Metadata } from "next";
import { ParentsHero } from "@/components/pages/parents/ParentsHero";
import { Worries } from "@/components/pages/parents/Worries";
import { FoundersQuote } from "@/components/pages/parents/FoundersQuote";

export const metadata: Metadata = {
  title: "Parents — NILPro",
};

export default function Parents() {
  return (
    <main>
      <ParentsHero />
      <Worries />
      <FoundersQuote />
    </main>
  );
}
