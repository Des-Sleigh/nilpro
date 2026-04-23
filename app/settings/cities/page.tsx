import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "Edit pitch cities — NILPro",
};

export default function SettingsCitiesPage() {
  return (
    <PlaceholderHero
      eyebrow="PITCH CITIES"
      title="Update your pitch cities —"
      accent="coming in the next build."
      body="Add a new city, change your radius, or remove one. For now the locations you picked during signup are what we're pitching in."
    />
  );
}
