import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type PublicProfile = {
  member_id: string;
  first_name: string;
  last_name: string;
  sport: string;
  position: string | null;
  level: string;
  school: string;
  graduation_year: number | null;
  hometown_state: string | null;
  profile_photo_url: string | null;
  member_year: number;
};

async function loadProfile(memberId: string): Promise<PublicProfile | null> {
  if (!/^\d{5,}$/.test(memberId)) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .rpc("get_public_athlete_profile", { p_member_id: memberId })
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PublicProfile;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ memberId: string }>;
}): Promise<Metadata> {
  const { memberId } = await params;
  const profile = await loadProfile(memberId);
  if (!profile) {
    return { title: "Athlete profile — NILPro" };
  }
  const fullName = `${profile.first_name} ${profile.last_name}`;
  return {
    title: `${fullName} — Verified NILPro Athlete`,
    description: `${fullName} is a verified ${profile.sport} athlete at ${profile.school}, member of NILPro since ${profile.member_year}.`,
    openGraph: {
      images: [`/api/cards/${memberId}?format=post`],
    },
  };
}

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const profile = await loadProfile(memberId);
  if (!profile) notFound();

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const sportLine = profile.position
    ? `${profile.sport} • ${profile.position}`
    : profile.sport;
  const classLine = profile.graduation_year
    ? `Class of ${profile.graduation_year}`
    : profile.level;
  const home = profile.hometown_state ?? "—";

  return (
    <main className="public-profile">
      <div className="container-page" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="pp-card">
          <div className="pp-card__head">
            {profile.profile_photo_url ? (
              <Image
                src={profile.profile_photo_url}
                alt={fullName}
                width={160}
                height={160}
                unoptimized
                className="pp-card__avatar"
              />
            ) : (
              <div className="pp-card__avatar pp-card__avatar--initials">
                {(profile.first_name[0] ?? "").toUpperCase()}
                {(profile.last_name[0] ?? "").toUpperCase()}
              </div>
            )}
            <div className="pp-card__name-block">
              <span className="label">VERIFIED ATHLETE · {profile.member_id}</span>
              <h1 className="pp-card__name">
                {profile.first_name} <span className="accent-green">{profile.last_name}</span>
              </h1>
              <span className="pp-card__sub">{profile.school}</span>
              <span className="pp-card__sub pp-card__sub--dim">{sportLine}</span>
            </div>
            <div className="pp-card__badge">
              <span>✓</span>
              <span>VERIFIED</span>
            </div>
          </div>

          <dl className="pp-meta">
            <div className="pp-meta__row">
              <dt>Class</dt>
              <dd>{classLine}</dd>
            </div>
            <div className="pp-meta__row">
              <dt>Hometown</dt>
              <dd>{home}</dd>
            </div>
            <div className="pp-meta__row">
              <dt>NILPro member since</dt>
              <dd>{profile.member_year}</dd>
            </div>
          </dl>

          <div className="pp-card__cta">
            <Link href="/" className="btn btn--ghost">What is NILPro? →</Link>
          </div>
        </div>

        <p className="pp-disclaimer">
          This profile is published by the athlete via NILPro. NILPro is a software
          platform — we are not the athlete&apos;s agent or representative. To talk
          with this athlete about a deal, contact them directly through their school
          or social channels. NILPro does not field deal inquiries on behalf of athletes.
        </p>
      </div>
    </main>
  );
}
