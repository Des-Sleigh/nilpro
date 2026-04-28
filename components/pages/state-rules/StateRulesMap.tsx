"use client";

import { useEffect, useRef, useState } from "react";
import type { HsNilStatus } from "@/lib/states/nilStatus";
import { HS_NIL_STATUS } from "@/lib/states/nilStatus";

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

type MapPath = { d: string; status: HsNilStatus; code: string };
type MapLabel = { x: number; y: number; code: string; cls: string };

export function StateRulesMap({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (code: string) => void;
}) {
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

          const status: HsNilStatus = HS_NIL_STATUS[code] || "off";
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
        console.error("StateRulesMap failed to load:", err);
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
    <div className="sr-map" ref={sectionRef}>
      <svg
        className="sr-map__svg"
        viewBox="0 0 960 600"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Click a state to see its NIL rules"
      >
        {paths &&
          paths.map((p) => {
            const isSelected = selected === p.code;
            return (
              <path
                key={p.code}
                className={`state state--${p.status}${
                  isSelected ? " state--selected" : ""
                }`}
                d={p.d}
                data-state={p.code}
                tabIndex={0}
                role="button"
                aria-label={`${p.code} rules`}
                aria-pressed={isSelected}
                onClick={() => onSelect(p.code)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(p.code);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <title>{p.code}</title>
              </path>
            );
          })}
        {labels.map((l) => (
          <text
            key={l.code}
            className={l.cls}
            x={l.x}
            y={l.y}
            style={{ pointerEvents: "none" }}
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

      <div className="sr-map__legend">
        <div className="legend-item">
          <span className="swatch swatch--on"></span>
          Full HS NIL access
        </div>
        <div className="legend-item">
          <span className="swatch swatch--partial"></span>
          Restrictions apply
        </div>
        <div className="legend-item">
          <span className="swatch swatch--off"></span>
          HS NIL not yet permitted
        </div>
      </div>
    </div>
  );
}
