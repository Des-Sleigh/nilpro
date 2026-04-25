import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PitchesTable,
  type PitchRow,
} from "@/components/admin/PitchesTable";

export const metadata: Metadata = {
  title: "Pitches — NILPro Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPitchesPage() {
  const sb = createAdminClient();

  const { data: pitches } = await sb
    .from("pitches")
    .select(
      "id, status, sent_at, responded_at, response_text, athlete_id, business_id, athletes(first_name,last_name), businesses(name)"
    )
    .order("sent_at", { ascending: false })
    .limit(2000);

  type AthleteMini = { first_name: string; last_name: string };
  type BizMini = { name: string };
  type PitchRaw = {
    id: string;
    status: string;
    sent_at: string | null;
    responded_at: string | null;
    response_text: string | null;
    athlete_id: string;
    business_id: string;
    athletes: AthleteMini | AthleteMini[] | null;
    businesses: BizMini | BizMini[] | null;
  };
  const rows: PitchRow[] = ((pitches ?? []) as unknown as PitchRaw[]).map(
    (p) => {
      const a = Array.isArray(p.athletes) ? p.athletes[0] : p.athletes;
      const b = Array.isArray(p.businesses) ? p.businesses[0] : p.businesses;
      return {
        id: p.id,
        status: p.status,
        sent_at: p.sent_at,
        responded_at: p.responded_at,
        response_text: p.response_text,
        athlete_id: p.athlete_id,
        business_id: p.business_id,
        athlete_name: a ? `${a.first_name} ${a.last_name}` : "—",
        business_name: b?.name ?? "—",
      };
    }
  );

  return (
    <>
      <h1 className="admin-h1">
        Pitches <em>{rows.length}</em>
      </h1>
      <div className="admin-sub">Every pitch logged across all athletes</div>
      <PitchesTable rows={rows} />
    </>
  );
}
