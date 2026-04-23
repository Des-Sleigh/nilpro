import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "Edit deal menu — NILPro",
};

export default function SettingsDealMenuPage() {
  return (
    <PlaceholderHero
      eyebrow="DEAL MENU"
      title="Edit your deal menu —"
      accent="coming in the next build."
      body="Update which deal types you accept and tweak your minimums. For now the values you set during signup are live. We'll have an in-dashboard editor up shortly."
    />
  );
}
