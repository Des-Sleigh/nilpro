"use client";

import { useEffect } from "react";

const SELECTOR =
  ".section-head, .play-card, .deal-slip, .worry, .steps li, .tier, .tl-card, .rung, .mechanic";

export function RevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    document.querySelectorAll(SELECTOR).forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
