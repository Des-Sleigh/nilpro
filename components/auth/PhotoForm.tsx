"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  /** Optional existing photo URL — used by settings/profile as the preview. */
  initialPhotoUrl?: string | null;
  /** Where to go after a successful upload or skip. */
  nextHref?: string;
  /** If false, hide the "Skip for now" button — used in settings. */
  allowSkip?: boolean;
  /** Label for the primary button on success (defaults to "Continue"). */
  submitLabel?: string;
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function extFromType(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function PhotoForm({
  userId,
  initialPhotoUrl = null,
  nextHref = "/signup/done",
  allowSkip = true,
  submitLabel = "Save photo & continue →",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhotoUrl);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handlePick(f: File | null) {
    setError(null);
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setError("Use a JPG, PNG, or WEBP image.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("That image is over 10 MB — pick a smaller one.");
      return;
    }
    setFile(f);
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }

  async function handleUpload() {
    if (!file) {
      setError("Pick an image first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = extFromType(file.type);
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadErr) {
        setError(uploadErr.message);
        setBusy(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      // Bust CDN/browser caches after an overwrite.
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updErr } = await supabase
        .from("athletes")
        .update({
          profile_photo_url: urlWithBust,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updErr) {
        setError(updErr.message);
        setBusy(false);
        return;
      }

      router.push(nextHref);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setError(msg);
      setBusy(false);
    }
  }

  function handleSkip() {
    router.push(nextHref);
  }

  return (
    <div
      className="auth-form"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {error ? (
        <div
          role="alert"
          style={{
            padding: "0.85rem 1rem",
            border: "1px solid var(--red)",
            background: "rgba(255, 58, 87, 0.08)",
            borderRadius: "var(--r-sm)",
            fontSize: "0.9rem",
            color: "var(--red)",
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.85rem",
          width: "100%",
          minHeight: "16rem",
          padding: "2rem 1rem",
          border: `2px dashed ${
            previewUrl ? "var(--green)" : "var(--border-strong)"
          }`,
          background: previewUrl ? "var(--green-dim)" : "var(--bg-soft)",
          borderRadius: "var(--r-md)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          color: "var(--text-dim)",
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Profile preview"
            style={{
              width: "10rem",
              height: "10rem",
              objectFit: "cover",
              borderRadius: "9999px",
              border: "3px solid var(--green)",
            }}
          />
        ) : (
          <div
            style={{
              width: "10rem",
              height: "10rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              background: "var(--bg)",
              border: "2px dashed var(--border-strong)",
              fontFamily: "var(--mono)",
              fontSize: "2rem",
              color: "var(--text-faint)",
            }}
          >
            +
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--cond)",
              fontSize: "1rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: previewUrl ? "var(--green)" : "var(--text)",
            }}
          >
            {previewUrl ? "Tap to change photo" : "Tap to upload"}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: "0.35rem",
            }}
          >
            JPG, PNG, or WEBP · up to 10 MB
          </div>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={handleUpload}
        disabled={busy || !file}
        className="btn btn--primary btn--lg"
        style={{ width: "100%", justifyContent: "center" }}
      >
        {busy ? "Uploading…" : submitLabel}
      </button>

      {allowSkip ? (
        <button
          type="button"
          onClick={handleSkip}
          disabled={busy}
          className="btn btn--ghost"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Skip for now
        </button>
      ) : null}
    </div>
  );
}
