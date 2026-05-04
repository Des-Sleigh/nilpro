"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";

type Props = {
  userId: string;
  /** Optional existing photo URL — used by settings/profile as the preview. */
  initialPhotoUrl?: string | null;
  /** Where to go after a successful upload or skip. */
  nextHref?: string;
  /** If false, hide the "Skip for now" button — used in settings. */
  allowSkip?: boolean;
  /** Label for the primary button on success (defaults to "Save photo & continue →"). */
  submitLabel?: string;
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const VIEWPORT = 240;
const EXPORT_SIZE = 240;
const EXPORT_QUALITY = 0.9;

export function PhotoForm({
  userId,
  initialPhotoUrl = null,
  nextHref = "/signup/done",
  allowSkip = true,
  submitLabel = "Save photo & continue →",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const router = useRouter();

  // The locally-picked file. When null, we show the initial URL (if any)
  // as a non-draggable preview.
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhotoUrl);

  // Natural image dimensions once loaded.
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(
    null
  );

  // Offset of the image's top-left from the viewport's top-left, in
  // viewport CSS pixels. The image is rendered at a fixed "cover" size —
  // its shorter side equals VIEWPORT.
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragState = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    pointerId: number | null;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    pointerId: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Clean up any blob URL we created.
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderedSize(n: { w: number; h: number }): { w: number; h: number } {
    // Scale image so its SHORTER side fills the viewport.
    const ratio = VIEWPORT / Math.min(n.w, n.h);
    return { w: n.w * ratio, h: n.h * ratio };
  }

  function clampOffset(
    raw: { x: number; y: number },
    n: { w: number; h: number }
  ): { x: number; y: number } {
    const r = renderedSize(n);
    // Image must cover the viewport — offsets are negative (we shift
    // the top-left of the image up/left to reveal more of the image).
    const minX = VIEWPORT - r.w;
    const minY = VIEWPORT - r.h;
    const maxX = 0;
    const maxY = 0;
    return {
      x: Math.min(maxX, Math.max(minX, raw.x)),
      y: Math.min(maxY, Math.max(minY, raw.y)),
    };
  }

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
    setNatural(null);
    setOffset({ x: 0, y: 0 });
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const el = e.currentTarget;
    const n = { w: el.naturalWidth, h: el.naturalHeight };
    setNatural(n);
    // Center the image in the viewport on load.
    const r = renderedSize(n);
    setOffset({
      x: (VIEWPORT - r.w) / 2,
      y: (VIEWPORT - r.h) / 2,
    });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!natural || !file) return;
    e.preventDefault();
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* not all browsers support setPointerCapture on touch */
    }
    dragState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
      pointerId: e.pointerId,
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = dragState.current;
    if (!s.active || !natural) return;
    // Block scroll/zoom while dragging on touch.
    e.preventDefault();
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    const nextRaw = {
      x: s.startOffsetX + dx,
      y: s.startOffsetY + dy,
    };
    setOffset(clampOffset(nextRaw, natural));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const s = dragState.current;
    if (!s.active) return;
    try {
      if (s.pointerId !== null) {
        e.currentTarget.releasePointerCapture(s.pointerId);
      }
    } catch {
      /* ignore */
    }
    dragState.current = {
      active: false,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      pointerId: null,
    };
  }

  async function renderCrop(): Promise<Blob | null> {
    if (!imgRef.current || !natural) return null;
    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Paint a transparent/opaque background first — JPEGs don't support
    // alpha so we pad with white to avoid a black circle edge.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

    // Clip to a circle.
    ctx.save();
    ctx.beginPath();
    ctx.arc(EXPORT_SIZE / 2, EXPORT_SIZE / 2, EXPORT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // The viewport is rendered at VIEWPORT px; export is at EXPORT_SIZE px.
    // They're currently 1:1 but if they ever diverge we keep this ratio.
    const scale = EXPORT_SIZE / VIEWPORT;
    const r = renderedSize(natural);
    const drawW = r.w * scale;
    const drawH = r.h * scale;
    const drawX = offset.x * scale;
    const drawY = offset.y * scale;

    ctx.drawImage(imgRef.current, drawX, drawY, drawW, drawH);
    ctx.restore();

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        EXPORT_QUALITY
      );
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
      const blob = await renderCrop();
      if (!blob) {
        setError("Couldn't prepare that image — try another file.");
        setBusy(false);
        return;
      }

      const supabase = createClient();
      const path = `${userId}/avatar.jpg`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadErr) {
        setError(uploadErr.message);
        setBusy(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

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

      track("photo_uploaded", { user_id: userId });
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

  // Compute render dimensions for the <img> element.
  const imgStyle: React.CSSProperties = natural
    ? {
        position: "absolute",
        left: 0,
        top: 0,
        width: `${renderedSize(natural).w}px`,
        height: `${renderedSize(natural).h}px`,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        maxWidth: "none",
        userSelect: "none",
        pointerEvents: "none",
        willChange: "transform",
      }
    : {
        position: "absolute",
        left: 0,
        top: 0,
        width: `${VIEWPORT}px`,
        height: `${VIEWPORT}px`,
        objectFit: "cover",
        userSelect: "none",
        pointerEvents: "none",
      };

  const isDraggable = Boolean(previewUrl && natural && file);

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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.85rem",
        }}
      >
        <div
          ref={viewportRef}
          onPointerDown={isDraggable ? onPointerDown : undefined}
          onPointerMove={isDraggable ? onPointerMove : undefined}
          onPointerUp={isDraggable ? onPointerUp : undefined}
          onPointerCancel={isDraggable ? onPointerUp : undefined}
          style={{
            position: "relative",
            width: `${VIEWPORT}px`,
            height: `${VIEWPORT}px`,
            borderRadius: "9999px",
            border: `2px dashed ${
              previewUrl ? "var(--green)" : "var(--border-strong)"
            }`,
            background: previewUrl ? "var(--green-dim)" : "var(--bg-soft)",
            overflow: "hidden",
            touchAction: isDraggable ? "none" : "auto",
            cursor: isDraggable ? "grab" : "pointer",
          }}
          onClick={(e) => {
            // Tapping the circle when no image is picked opens the picker.
            if (!previewUrl) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          role={isDraggable ? "img" : undefined}
          aria-label={
            isDraggable
              ? "Drag to reposition your photo inside the circle"
              : undefined
          }
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Profile preview"
              onLoad={onImgLoad}
              draggable={false}
              style={imgStyle}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--mono)",
                fontSize: "2rem",
                color: "var(--text-faint)",
              }}
            >
              +
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            color: previewUrl ? "var(--green)" : "var(--text)",
            fontFamily: "var(--cond)",
            fontSize: "0.95rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {previewUrl ? "Tap to change photo" : "Tap to upload"}
        </button>

        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {isDraggable ? (
            <>Drag inside the circle to reposition · JPG, PNG, or WEBP · up to 10 MB</>
          ) : (
            <>JPG, PNG, or WEBP · up to 10 MB</>
          )}
        </div>
      </div>

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
        className={`btn btn--primary btn--lg${busy ? " btn--pending" : ""}`}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {busy ? (
          <>
            <span aria-hidden className="btn__spinner" />
            Uploading…
          </>
        ) : (
          submitLabel
        )}
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
