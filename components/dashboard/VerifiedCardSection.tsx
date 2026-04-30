"use client";

import { useState } from "react";
import { PhotoForm } from "@/components/auth/PhotoForm";

type Props = {
  memberId: string | null;
  isVerified: boolean;
  userId: string;
  profilePhotoUrl: string | null;
};

export function VerifiedCardSection({
  memberId,
  isVerified,
  userId,
  profilePhotoUrl,
}: Props) {
  const [format, setFormat] = useState<"story" | "post">("story");

  if (!memberId) {
    return (
      <div className="vcard-section">
        <div className="vcard-section__head">
          <span className="label">YOUR VERIFIED CARD</span>
          <h2>Card pending</h2>
        </div>
        <p className="vcard-section__lede">
          Your member ID is being assigned. Refresh in a moment to see your
          Verified Athlete Card.
        </p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="vcard-section">
        <div className="vcard-section__head">
          <span className="label">YOUR VERIFIED CARD · {memberId}</span>
          <h2>Verify to unlock your card</h2>
        </div>
        <p className="vcard-section__lede">
          Once your Instagram is verified, your Verified Athlete Card unlocks
          here — downloadable for your IG Story or feed post.
        </p>
      </div>
    );
  }

  // Verified but no photo — prompt for upload right here so they can
  // generate a custom card. The card endpoint already falls back to an
  // initials avatar if they skip, but the photo is what makes it personal.
  if (!profilePhotoUrl) {
    return (
      <div className="vcard-section">
        <div className="vcard-section__head">
          <span className="label">YOUR VERIFIED CARD · {memberId}</span>
          <h2>
            Add your photo to <span className="accent-green">unlock your card</span>
          </h2>
          <p className="vcard-section__lede">
            Your Instagram is verified — last step is your photo. Upload a clean
            head-and-shoulders shot below; we&apos;ll drop it onto your Verified
            Athlete Card so you can post it to your IG Story or feed.
          </p>
        </div>

        <div className="vcard-section__photo-upload">
          <PhotoForm
            userId={userId}
            allowSkip={false}
            nextHref="/dashboard"
            submitLabel="Upload &amp; generate my card →"
          />
        </div>
      </div>
    );
  }

  // Cache-buster keyed to the photo URL so the card refreshes the instant
  // a new photo is uploaded. PhotoForm appends `?t=<timestamp>` to the
  // photo URL on save; we mirror that timestamp into the card URL so
  // the browser treats it as a new resource and re-fetches.
  const photoVersion =
    profilePhotoUrl?.match(/[?&]t=(\d+)/)?.[1] ?? "default";
  const cardSrc = `/api/cards/${memberId}?format=${format}&v=${photoVersion}`;
  const downloadName = `nilpro-${memberId}-${format}.png`;
  const profileUrl = `/a/${memberId}`;

  return (
    <div className="vcard-section">
      <div className="vcard-section__head">
        <span className="label">YOUR VERIFIED CARD · {memberId}</span>
        <h2>
          Share your <span className="accent-green">verified status</span>
        </h2>
        <p className="vcard-section__lede">
          Post your Verified Athlete Card to your IG Story or feed. Every share
          drives traffic to your public profile and tells local businesses
          you&apos;re real.
        </p>
      </div>

      <div className="vcard-section__body">
        <div className="vcard-section__preview">
          <img
            src={cardSrc}
            alt={`Verified athlete card · ${memberId}`}
            className={`vcard-preview vcard-preview--${format}`}
          />
        </div>

        <div className="vcard-section__controls">
          <div className="vcard-section__toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={format === "story"}
              className={`vcard-section__toggle-btn ${
                format === "story" ? "vcard-section__toggle-btn--active" : ""
              }`}
              onClick={() => setFormat("story")}
            >
              Story / TikTok
              <span className="vcard-section__toggle-meta">9:16 · 1080×1920</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={format === "post"}
              className={`vcard-section__toggle-btn ${
                format === "post" ? "vcard-section__toggle-btn--active" : ""
              }`}
              onClick={() => setFormat("post")}
            >
              IG Post
              <span className="vcard-section__toggle-meta">4:5 · 1080×1350</span>
            </button>
          </div>

          <div className="vcard-section__actions">
            <a
              href={cardSrc}
              download={downloadName}
              className="btn btn--primary btn--lg"
            >
              Download {format === "story" ? "Story" : "Post"} →
            </a>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener"
              className="btn btn--ghost btn--lg"
            >
              View public profile →
            </a>
          </div>

          <div className="vcard-section__copy-row">
            <CopyProfileLink memberId={memberId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyProfileLink({ memberId }: { memberId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/a/${memberId}`
    : `https://thenilpro.com/a/${memberId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Older Safari fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
      document.body.removeChild(ta);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="vcard-section__copy"
      aria-label="Copy public profile link"
    >
      <span className="vcard-section__copy-url">{url.replace(/^https?:\/\//, "")}</span>
      <span className="vcard-section__copy-cta">
        {copied ? "Copied ✓" : "Copy link"}
      </span>
    </button>
  );
}
