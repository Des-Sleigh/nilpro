"use client";

import { useEffect, useRef, useState } from "react";

type Status = "on" | "partial" | "off";

// College NIL is legal in all 50 states + DC (since July 2021)
const stateStatus: Record<string, Status> = {
  AL: "off",  AK: "on",   AZ: "on",   AR: "on",   CA: "on",
  CO: "on",   CT: "on",   DE: "on",   DC: "on",   FL: "on",
  GA: "on",   HI: "off",  ID: "on",   IL: "on",   IN: "partial",
  IA: "on",   KS: "on",   KY: "on",   LA: "on",   ME: "on",
  MD: "on",   MA: "on",   MI: "partial", MN: "on",   MS: "on",
  MO: "on",   MT: "partial", NE: "on",   NV: "on",   NH: "on",
  NJ: "on",   NM: "on",   NY: "on",   NC: "on",   ND: "on",
  OH: "partial", OK: "on",   OR: "on",   PA: "on",   RI: "on",
  SC: "on",   SD: "on",   TN: "on",   TX: "partial", UT: "on",
  VT: "on",   VA: "on",   WA: "on",   WV: "on",   WI: "on",
  WY: "on",
};

// FIPS numeric state id to 2-letter code (us-atlas TopoJSON uses FIPS ids)
const fipsToCode: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
  "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
  "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
  "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
  "56": "WY",
};

const TINY_STATES = new Set(["DC", "DE", "RI", "CT", "NH", "VT", "NJ", "MD", "MA"]);

type MapPath = { d: string; status: Status; code: string };
type MapLabel = { x: number; y: number; code: string; cls: string };

export function NilMap() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [paths, setPaths] = useState<MapPath[] | null>(null);
  const [labels, setLabels] = useState<MapLabel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    let loaded = false;
    let cancelled = false;

    const load = async () => {
      if (loaded) return;
      loaded = true;

      try {
        const [{ geoAlbersUsa, geoPath }, topojson] = await Promise.all([
          import("d3-geo"),
          import("topojson-client"),
        ]);

        const res = await fetch(
          "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"
        );
        if (!res.ok) throw new Error(`Failed to fetch atlas: ${res.status}`);
        const us = await res.json();

        // `topojson.feature` returns a Feature or FeatureCollection depending on input;
        // for state-level "states" object it will be a FeatureCollection.
        const statesFC = topojson.feature(us, us.objects.states) as unknown as {
          features: Array<{
            id: string | number;
            geometry: unknown;
            properties: unknown;
          }>;
        };

        const projection = geoAlbersUsa().fitSize([960, 600], statesFC as never);
        const pathGen = geoPath(projection);

        const nextPaths: MapPath[] = [];
        const nextLabels: MapLabel[] = [];

        for (const feature of statesFC.features) {
          const fips = String(feature.id).padStart(2, "0");
          const code = fipsToCode[fips];
          if (!code) continue;

          const status: Status = stateStatus[code] || "off";
          const d = pathGen(feature as never);
          if (!d) continue;

          nextPaths.push({ d, status, code });

          if (!TINY_STATES.has(code)) {
            const centroid = pathGen.centroid(feature as never);
            const cx = centroid[0];
            const cy = centroid[1];
            if (!isNaN(cx) && !isNaN(cy)) {
              const cls =
                status === "off"
                  ? "state-label state-label--off"
                  : status === "partial"
                  ? "state-label state-label--partial"
                  : "state-label";
              nextLabels.push({
                x: Number(cx.toFixed(1)),
                y: Number((cy + 3).toFixed(1)),
                code,
                cls,
              });
            }
          }
        }

        if (!cancelled) {
          setPaths(nextPaths);
          setLabels(nextLabels);
        }
      } catch (err) {
        console.error("NilMap failed to load:", err);
        if (!cancelled) setError("Map loading… check connection");
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            load();
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <section className="nilmap-section" ref={sectionRef}>
      <div className="container-page">
        <div className="section-head" style={{ marginBottom: "2.5rem" }}>
          <span className="label">03.5 / ELIGIBILITY</span>
          <h2>
            NIL is legal <span className="accent-green">where you play.</span>
          </h2>
          <p className="section-head__lede">
            College NIL is legal in all 50 states. High-school NIL is legal in 45
            states plus DC — a handful still have restrictions. We check your state
            automatically during signup and flag anything you need to know.
          </p>
        </div>

        <div className="nilmap-wrap">
          <div className="nilmap">
            <svg
              className="nilmap__svg"
              viewBox="0 0 960 600"
              xmlns="http://www.w3.org/2000/svg"
            >
              {paths &&
                paths.map((p) => (
                  <path
                    key={p.code}
                    className={`state state--${p.status}`}
                    d={p.d}
                    data-state={p.code}
                  >
                    <title>{p.code}</title>
                  </path>
                ))}
              {labels.map((l) => (
                <text
                  key={l.code}
                  className={l.cls}
                  x={l.x}
                  y={l.y}
                >
                  {l.code}
                </text>
              ))}
              {!paths && !error && (
                <text
                  x={480}
                  y={300}
                  fill="#6a7690"
                  textAnchor="middle"
                  fontFamily="Barlow, sans-serif"
                  fontSize={16}
                >
                  Loading map…
                </text>
              )}
              {error && (
                <text
                  x={480}
                  y={300}
                  fill="#6a7690"
                  textAnchor="middle"
                  fontFamily="Barlow, sans-serif"
                  fontSize={16}
                >
                  {error}
                </text>
              )}
            </svg>

            <div className="nilmap__legend">
              <div className="legend-item">
                <span className="swatch swatch--on"></span>
                Full NIL access
              </div>
              <div className="legend-item">
                <span className="swatch swatch--partial"></span>
                Age / format restrictions
              </div>
              <div className="legend-item">
                <span className="swatch swatch--off"></span>
                HS NIL not yet permitted
              </div>
            </div>

            <div
              style={{
                marginTop: "0.85rem",
                padding: "0.85rem",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontFamily: "var(--body)",
                fontSize: "0.82rem",
                lineHeight: 1.5,
                color: "var(--text-dim)",
              }}
            >
              <strong
                style={{
                  color: "var(--gold)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                About restrictions
              </strong>
              <div style={{ marginTop: "0.4rem" }}>
                Some states allow HS NIL only under specific conditions — age
                minimums (e.g. 17+), delayed payment until college enrollment,
                mandatory school disclosure, or limits on deal types. We flag these
                automatically during signup and handle disclosure requirements for
                you.
              </div>
            </div>

            <div className="nilmap__stats">
              <div className="nilmap__stat">
                <span className="num">50</span>
                <span className="label">States · college NIL</span>
              </div>
              <div className="nilmap__stat">
                <span className="num">45</span>
                <span className="label">States + DC · HS NIL</span>
              </div>
              <div className="nilmap__stat">
                <span className="num">&lt;24h</span>
                <span className="label">Auto state check</span>
              </div>
            </div>
          </div>

          <div className="nilmap-side">
            <h3>
              Every <em>college</em> athlete qualifies. Most HS too.
            </h3>
            <p>
              If you&apos;re a <strong>college athlete</strong> — D1, D2, D3, NAIA,
              JUCO, or club — you&apos;re good. NIL has been federally protected
              since 2021 and every state association allows it.
            </p>
            <p>
              If you&apos;re a <strong>high school athlete</strong>, 45 states plus
              DC allow full NIL access. A few states still restrict deals, and some
              require school notification or parental consent. We check your state
              during signup and handle any disclosures automatically.
            </p>

            <div className="nilmap-side__lookup">
              <div className="nilmap-side__lookup-title">
                ⚡ Don&apos;t see your state?
              </div>
              <p>
                Rules change constantly. Sign up and we&apos;ll verify your specific
                eligibility within 24 hours — full refund if your state turns out to
                not permit NIL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
