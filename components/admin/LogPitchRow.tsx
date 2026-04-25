"use client";

import { useState } from "react";
import { logPitchAction } from "@/app/admin/athletes/[id]/actions";

export function LogPitchRow({
  athleteId,
  businessId,
  targetListId,
}: {
  athleteId: string;
  businessId: string;
  targetListId: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        className="admin-btn admin-btn--sm"
        onClick={() => setOpen(true)}
      >
        Log pitch sent
      </button>
    );
  }

  return (
    <form action={logPitchAction} className="admin-form" style={{ width: "100%" }}>
      <input type="hidden" name="athlete_id" value={athleteId} />
      <input type="hidden" name="business_id" value={businessId} />
      <input type="hidden" name="target_list_id" value={targetListId} />
      <input
        className="admin-input"
        type="text"
        name="subject"
        placeholder="Subject (optional)"
      />
      <textarea
        className="admin-textarea"
        name="body"
        placeholder="Body (optional)"
      />
      <textarea
        className="admin-textarea"
        name="notes"
        placeholder="Internal notes (optional)"
        style={{ minHeight: "3rem" }}
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" className="admin-btn admin-btn--gold admin-btn--sm">
          Save pitch
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--sm"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
