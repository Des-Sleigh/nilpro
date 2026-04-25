"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Small client-only button used in the admin verification queue. Copies
 * a 6-digit verification code to the clipboard and flashes "Copied ✓"
 * for ~1.5 seconds. Falls back to a basic textarea-select trick when
 * navigator.clipboard is unavailable (e.g. older browsers, http origins).
 */
export function CopyCodeButton({
  code,
  label = "Copy code",
}: {
  code: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleClick() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for non-secure contexts.
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Soft-fail — surface a brief error in place of the success label.
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="admin-btn admin-btn--sm"
      aria-label={`Copy verification code ${code}`}
      style={{ whiteSpace: "nowrap" }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
