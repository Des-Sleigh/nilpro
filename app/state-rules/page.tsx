import type { Metadata } from "next";
import { StateRulesExplorer } from "@/components/pages/state-rules/StateRulesExplorer";

export const metadata: Metadata = {
  title: "NIL rules by state — NILPro",
  description:
    "High-school NIL rules vary by state. See parental consent, co-signature, notarization, banned categories, and school-disclosure requirements for your state.",
};

export default function StateRulesPage() {
  return (
    <main className="sr-shell">
      <section className="sr-intro">
        <div className="container-page">
          <div className="section-head">
            <span className="label">04 / RULES BY STATE</span>
            <h2>
              NIL rules vary <span className="accent-green">by state.</span>
            </h2>
            <p className="section-head__lede">
              Pick your state to see what&apos;s permitted, whether your parent
              has to co-sign deal contracts, what categories are off-limits, and
              what your school needs to know. Rules change frequently — always
              confirm with your school&apos;s athletic director before signing
              anything.
            </p>
          </div>
        </div>
      </section>

      <section className="sr-section-wrap">
        <div className="container-page">
          <StateRulesExplorer />
        </div>
      </section>

      <section className="sr-disclaimer-wrap">
        <div className="container-page">
          <div className="sr-disclaimer">
            <strong>This is informational, not legal advice.</strong> NILPro is
            a software platform — we are not your attorney and do not represent
            you. Rules change frequently and may be different at the school or
            district level. Confirm with your school&apos;s athletic director and,
            for any significant deal, a sports/entertainment attorney before
            signing.
          </div>
        </div>
      </section>
    </main>
  );
}
