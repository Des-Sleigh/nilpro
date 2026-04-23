"use client";

import { useEffect } from "react";

/**
 * Force scroll-to-top whenever this component mounts. Next.js usually
 * handles scroll on route changes, but server-action redirects that land
 * on a sibling route sometimes preserve scroll position — especially on
 * mobile Safari. Drop this into any page whose first impression must
 * start at the top of the viewport (e.g. every signup step).
 */
export function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return null;
}
