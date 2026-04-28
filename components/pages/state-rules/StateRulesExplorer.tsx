"use client";

import { useEffect, useState } from "react";
import { allStateRules, rulesFor, STATE_RULES } from "@/lib/states/stateRules";
import { StateRulesMap } from "./StateRulesMap";
import { StateDetailPanel } from "./StateDetailPanel";

const ALL_RULES = allStateRules();

function readInitialState(): string {
  if (typeof window === "undefined") return "CA";
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("state");
  if (fromUrl && STATE_RULES[fromUrl.toUpperCase()]) {
    return fromUrl.toUpperCase();
  }
  return "CA";
}

export function StateRulesExplorer() {
  const [selected, setSelected] = useState<string>("CA");

  useEffect(() => {
    setSelected(readInitialState());
  }, []);

  const handleSelect = (code: string) => {
    setSelected(code);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("state", code);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const rules = rulesFor(selected);

  return (
    <div className="sr-explorer">
      <div className="sr-explorer__map-col">
        <StateRulesMap selected={selected} onSelect={handleSelect} />
        <div className="sr-explorer__picker">
          <label htmlFor="sr-state-select" className="label">
            Or pick from a list
          </label>
          <select
            id="sr-state-select"
            value={selected}
            onChange={(e) => handleSelect(e.target.value)}
            className="sr-select"
          >
            {ALL_RULES.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
                {!r.documented ? " (in progress)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sr-explorer__detail-col">
        {rules ? (
          <StateDetailPanel rules={rules} />
        ) : (
          <div className="sr-detail">
            <p>Pick a state on the map or from the list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
