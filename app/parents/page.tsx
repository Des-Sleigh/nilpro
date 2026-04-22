import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "Parents — NILPro",
};

export default function Parents() {
  return (
    <PlaceholderHero
      eyebrow="FOR PARENTS"
      title="What every parent"
      accent="needs to know."
      body="For parents of student-athletes. Legal, compliance, contracts, minors, school rules, and where the money goes."
    />
  );
}
