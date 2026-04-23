import type { Metadata } from "next";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export const metadata: Metadata = {
  title: "Edit profile — NILPro",
};

export default function SettingsProfilePage() {
  return (
    <PlaceholderHero
      eyebrow="PROFILE"
      title="Edit your profile —"
      accent="coming in the next build."
      body="Update your sport, school, handle, and hometown. The profile editor ships with the next settings drop."
    />
  );
}
