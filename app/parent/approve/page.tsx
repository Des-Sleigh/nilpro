import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveByTokenAction, lookUpByCodeAction } from "./actions";

export const metadata: Metadata = {
  title: "Approve · NILPro",
  description: "Give consent for your athlete to use NILPro.",
};

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type AthleteRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  sport: string | null;
  school: string | null;
  level: string | null;
  hometown_city: string | null;
  hometown_state: string | null;
  date_of_birth: string | null;
  parent_first_name: string | null;
  parent_approved_at: string | null;
  business_categories: string[] | null;
};

type DealMenuRow = {
  cash_per_post_enabled: boolean | null;
  cash_per_post_min: number | null;
  gear_enabled: boolean | null;
  product_trade_enabled: boolean | null;
  appearance_enabled: boolean | null;
  appearance_min: number | null;
};

type CityRow = { city: string | null; state: string | null };

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function errorMessage(code: string | undefined): string | null {
  switch (code) {
    case "bad_code":
      return "That code didn't match. Double-check the 6 digits and try again.";
    case "rate_limited":
      return "Too many tries — wait a few minutes and try again.";
    case "invalid":
    case "not_found":
      return "That approval link is no longer valid. Use the 6-digit code below.";
    case "server":
      return "Something went wrong on our end. Try again, or reply to the email.";
    default:
      return null;
  }
}

const PANEL = "#0d1118";
const PANEL_2 = "#141923";
const BORDER = "#242c3d";
const TEXT = "#ffffff";
const TEXT_DIM = "#aeb8cc";
const TEXT_MUTED = "#6a7690";
const GREEN = "#00e676";
const GREEN_INK = "#063";

export default async function ParentApprovePage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    approved?: string;
    error?: string;
  }>;
}) {
  const sp = await searchParams;
  const token = (sp.token ?? "").trim();
  const isApproved = sp.approved === "1";
  const errCode = sp.error;
  const errMsg = errorMessage(errCode);

  // ---- Success state (just-approved or already-approved by token) -------
  if (isApproved) {
    return <SuccessCard />;
  }

  // ---- Token branch: load + render approval card -------------------------
  if (token) {
    if (!UUID_RE.test(token)) {
      redirect("/parent/approve?error=invalid");
    }

    const sb = createAdminClient();
    const { data: athleteRaw } = await sb
      .from("athletes")
      .select(
        "id, first_name, last_name, sport, school, level, hometown_city, hometown_state, date_of_birth, parent_first_name, parent_approved_at, business_categories"
      )
      .eq("parent_approval_token", token)
      .maybeSingle();

    const athlete = athleteRaw as AthleteRow | null;

    if (!athlete) {
      // Could be already-approved (token cleared) or genuinely bad — fall
      // back to the code form.
      redirect("/parent/approve?error=not_found");
    }

    if (athlete.parent_approved_at) {
      return <SuccessCard athleteFirstName={athlete.first_name ?? null} />;
    }

    const [dealRes, citiesRes] = await Promise.all([
      sb
        .from("deal_menus")
        .select(
          "cash_per_post_enabled, cash_per_post_min, gear_enabled, product_trade_enabled, appearance_enabled, appearance_min"
        )
        .eq("athlete_id", athlete.id)
        .maybeSingle(),
      sb
        .from("pitch_cities")
        .select("city, state")
        .eq("athlete_id", athlete.id),
    ]);

    const deal = (dealRes.data ?? null) as DealMenuRow | null;
    const cities = (citiesRes.data ?? []) as CityRow[];

    return (
      <ApprovalCard
        athlete={athlete}
        deal={deal}
        cities={cities}
        token={token}
      />
    );
  }

  // ---- No token: render the code-entry form ------------------------------
  return <CodeEntryCard errMsg={errMsg} />;
}

// =====================================================================
// Subcomponents
// =====================================================================

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: "70vh",
        padding: "3rem 1rem 4rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>{children}</div>
    </main>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.72rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: GREEN,
        marginBottom: "0.6rem",
      }}
    >
      {children}
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div
      style={{
        background: "#2a1015",
        border: "1px solid #6b2230",
        borderRadius: 10,
        padding: "0.8rem 1rem",
        color: "#ffb6bf",
        fontSize: "0.92rem",
        marginBottom: "1rem",
      }}
    >
      {msg}
    </div>
  );
}

function SuccessCard({
  athleteFirstName = null,
}: {
  athleteFirstName?: string | null;
} = {}) {
  return (
    <Shell>
      <div
        style={{
          background: PANEL,
          border: "1px solid " + BORDER,
          borderRadius: 14,
          padding: "2.25rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "rgba(0, 230, 118, 0.15)",
            color: GREEN,
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
          aria-hidden
        >
          ✓
        </div>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            color: TEXT,
            textTransform: "uppercase",
            margin: "0 0 0.6rem 0",
            lineHeight: 1,
          }}
        >
          Approved
        </h1>
        <p
          style={{
            color: TEXT_DIM,
            fontSize: "1.05rem",
            margin: "0 0 0.5rem 0",
          }}
        >
          {athleteFirstName
            ? `${athleteFirstName} is good to go.`
            : "Your athlete is good to go."}
        </p>
        <p
          style={{
            color: TEXT_MUTED,
            fontSize: "0.92rem",
            margin: "0.4rem 0 0 0",
          }}
        >
          You can close this tab. We&apos;ll email you when their first deal is
          ready to review.
        </p>
      </div>
    </Shell>
  );
}

function CodeEntryCard({ errMsg }: { errMsg: string | null }) {
  return (
    <Shell>
      <div
        style={{
          background: PANEL,
          border: "1px solid " + BORDER,
          borderRadius: 14,
          padding: "2rem 1.75rem",
        }}
      >
        <Eyebrow>Parent approval</Eyebrow>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(1.85rem, 4.5vw, 2.5rem)",
            color: TEXT,
            textTransform: "uppercase",
            margin: "0 0 0.6rem 0",
            lineHeight: 1,
          }}
        >
          Enter the 6-digit code
        </h1>
        <p
          style={{
            color: TEXT_DIM,
            fontSize: "1rem",
            margin: "0 0 1.4rem 0",
          }}
        >
          Your athlete can find this code on their NILPro dashboard. Enter it
          here to give consent.
        </p>

        {errMsg ? <ErrorBanner msg={errMsg} /> : null}

        <form action={lookUpByCodeAction}>
          <label
            htmlFor="parent-code"
            style={{
              display: "block",
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: TEXT_MUTED,
              marginBottom: "0.45rem",
            }}
          >
            6-digit code
          </label>
          <input
            id="parent-code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="123456"
            required
            style={{
              width: "100%",
              padding: "0.95rem 1rem",
              fontFamily: "var(--mono)",
              fontSize: "1.4rem",
              letterSpacing: "0.22em",
              textAlign: "center",
              color: TEXT,
              background: PANEL_2,
              border: "1px solid " + BORDER,
              borderRadius: 10,
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "1rem 1.25rem",
              background: GREEN,
              color: GREEN_INK,
              fontFamily: "var(--display)",
              fontSize: "1.1rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Continue →
          </button>
        </form>

        <p
          style={{
            color: TEXT_MUTED,
            fontSize: "0.85rem",
            margin: "1.25rem 0 0 0",
            lineHeight: 1.5,
          }}
        >
          Got the email? You can also click the green button in the email and
          skip this step.
        </p>
      </div>
    </Shell>
  );
}

function ApprovalCard({
  athlete,
  deal,
  cities,
  token,
}: {
  athlete: AthleteRow;
  deal: DealMenuRow | null;
  cities: CityRow[];
  token: string;
}) {
  const fn = athlete.first_name ?? "your athlete";
  const ln = athlete.last_name ?? "";
  const age = ageFromDob(athlete.date_of_birth);
  const cityList = Array.from(
    new Set(
      cities
        .filter((c) => c.city && c.state)
        .map((c) => `${c.city}, ${c.state}`)
    )
  );

  const dealLines: string[] = [];
  if (deal) {
    if (deal.cash_per_post_enabled) {
      dealLines.push(
        deal.cash_per_post_min
          ? `Cash for posts (min $${deal.cash_per_post_min})`
          : "Cash for posts"
      );
    }
    if (deal.gear_enabled) dealLines.push("Free gear & products");
    if (deal.product_trade_enabled) dealLines.push("Free services & meals");
    if (deal.appearance_enabled) {
      dealLines.push(
        deal.appearance_min
          ? `Paid appearances (min $${deal.appearance_min})`
          : "Paid appearances"
      );
    }
  }

  return (
    <Shell>
      <div
        style={{
          background: PANEL,
          border: "1px solid " + BORDER,
          borderRadius: 14,
          padding: "2rem 1.75rem",
        }}
      >
        <Eyebrow>Parent approval</Eyebrow>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(1.85rem, 4.5vw, 2.5rem)",
            color: TEXT,
            textTransform: "uppercase",
            margin: "0 0 0.4rem 0",
            lineHeight: 1,
          }}
        >
          Approve {fn}&rsquo;s account
        </h1>
        <p
          style={{
            color: TEXT_DIM,
            fontSize: "1rem",
            margin: "0 0 1.5rem 0",
          }}
        >
          Hi {athlete.parent_first_name ?? "there"} — here&rsquo;s a quick
          recap before you say yes.
        </p>

        {/* Athlete summary */}
        <div
          style={{
            background: PANEL_2,
            border: "1px solid " + BORDER,
            borderRadius: 10,
            padding: "1.1rem 1.15rem",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--cond)",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: TEXT,
              marginBottom: "0.35rem",
            }}
          >
            {fn} {ln}
          </div>
          <div
            style={{
              color: TEXT_DIM,
              fontSize: "0.95rem",
              lineHeight: 1.55,
            }}
          >
            {[
              athlete.level,
              athlete.sport,
              athlete.school,
              age != null ? `age ${age}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
          {athlete.hometown_city && athlete.hometown_state ? (
            <div
              style={{
                color: TEXT_MUTED,
                fontSize: "0.88rem",
                marginTop: "0.25rem",
              }}
            >
              From {athlete.hometown_city}, {athlete.hometown_state}
            </div>
          ) : null}
        </div>

        {/* What they want to accept */}
        {dealLines.length > 0 ? (
          <SectionBlock title="What they want to accept">
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 1.1rem",
                color: TEXT_DIM,
                fontSize: "0.95rem",
                lineHeight: 1.55,
              }}
            >
              {dealLines.map((line) => (
                <li key={line} style={{ marginBottom: "0.3rem" }}>
                  {line}
                </li>
              ))}
            </ul>
          </SectionBlock>
        ) : null}

        {/* Pitch cities */}
        {cityList.length > 0 ? (
          <SectionBlock title="Where we&rsquo;ll pitch">
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}
            >
              {cityList.map((c) => (
                <span
                  key={c}
                  style={{
                    background: PANEL_2,
                    border: "1px solid " + BORDER,
                    color: TEXT,
                    fontSize: "0.85rem",
                    padding: "0.32rem 0.7rem",
                    borderRadius: 999,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </SectionBlock>
        ) : null}

        {/* Terms */}
        <SectionBlock title="What you’re saying yes to">
          <ul
            style={{
              margin: 0,
              padding: "0 0 0 1.1rem",
              color: TEXT_DIM,
              fontSize: "0.95rem",
              lineHeight: 1.6,
            }}
          >
            <li style={{ marginBottom: "0.4rem" }}>
              {fn} can use NILPro&rsquo;s tools and templates to pitch local businesses themselves.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              {fn} approves every business before any pitch goes out.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              You&rsquo;ll review every actual deal before it&rsquo;s signed.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              NILPro is software, not an agent — we never represent {fn} and
              we never touch any money.
            </li>
            <li>Deals are direct between {fn} and the business.</li>
          </ul>
        </SectionBlock>

        {/* Approve button */}
        <form action={approveByTokenAction} style={{ marginTop: "1.5rem" }}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "1.1rem 1.25rem",
              background: GREEN,
              color: GREEN_INK,
              fontFamily: "var(--display)",
              fontSize: "1.15rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 0 18px rgba(0, 230, 118, 0.35)",
            }}
          >
            ✓ I approve {fn}&rsquo;s NILPro account
          </button>
        </form>

        <p
          style={{
            color: TEXT_MUTED,
            fontSize: "0.82rem",
            margin: "1rem 0 0 0",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Questions? Just reply to the email — it goes straight to the founder.
        </p>
      </div>
    </Shell>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: GREEN,
          marginBottom: "0.55rem",
        }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {children}
    </div>
  );
}
