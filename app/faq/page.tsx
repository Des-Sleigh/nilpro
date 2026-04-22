import type { Metadata } from "next";
import { FaqHero } from "@/components/pages/faq/FaqHero";
import { FaqList } from "@/components/pages/faq/FaqList";

export const metadata: Metadata = {
  title: "FAQ — NILPro",
};

export default function FAQ() {
  return (
    <>
      <FaqHero />
      <FaqList />
    </>
  );
}
