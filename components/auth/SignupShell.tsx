import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ScrollToTopOnMount } from "@/components/util/ScrollToTopOnMount";

type Props = {
  step: number;
  total?: number;
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export async function SignupShell({
  step,
  total = 8,
  eyebrow,
  title,
  children,
  footer,
}: Props) {
  const pct = Math.round((step / total) * 100);

  // If the athlete row already exists, exit should send them back to the
  // dashboard instead of the marketing home (where "Get in the game" could
  // be confusing for someone mid-signup).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let exitHref: string = "/";
  if (user) {
    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    exitHref = athlete ? "/dashboard" : "/";
  }

  return (
    <main className="section" style={{ paddingTop: "clamp(2rem, 5vw, 4rem)" }}>
      <ScrollToTopOnMount />
      <div className="container-page" style={{ maxWidth: "34rem" }}>
        <div
          className="signup-progress"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          <span>
            Step{" "}
            <strong style={{ color: "var(--green)" }}>
              {String(step).padStart(2, "0")}
            </strong>{" "}
            of {String(total).padStart(2, "0")}
          </span>
          <Link href={exitHref} style={{ color: "var(--text-faint)" }}>
            Exit
          </Link>
        </div>

        <div
          style={{
            width: "100%",
            height: "3px",
            background: "var(--border)",
            borderRadius: "999px",
            overflow: "hidden",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "var(--green)",
              boxShadow: "0 0 10px var(--green-glow)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div className="section-head" style={{ marginBottom: "1.5rem" }}>
          <span className="label">{eyebrow}</span>
          <h1 style={{ marginTop: "1rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            {title}
          </h1>
        </div>

        {children}

        {footer ? <div style={{ marginTop: "2rem" }}>{footer}</div> : null}
      </div>
    </main>
  );
}
