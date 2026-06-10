"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

// The signature element: a full-width readiness board under the tabs. Five (or
// four) large numerals, each tinted by its status meaning, with small uppercase
// labels. Numerals count up once on first load (600ms), respecting reduced
// motion. One component serves both tabs.

export type StripTone = "ink" | "green" | "amber" | "red" | "neutral";

export interface StripItem {
  label: string;
  value: number;
  tone: StripTone;
}

const TONE_COLOR: Record<StripTone, string> = {
  ink: "#1A2433",
  green: "#1F7A4D",
  amber: "#C77D1F",
  red: "#C0392B",
  neutral: "#5B6B82",
};

function CountUp({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduced]);

  return <>{display}</>;
}

export function ReadinessStrip({ items }: { items: StripItem[] }) {
  return (
    <section
      aria-label="Readiness summary"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap gap-x-12 gap-y-4 px-6 py-5">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span
              className="font-condensed text-strip font-bold leading-none tnum"
              style={{ color: TONE_COLOR[item.tone] }}
            >
              <CountUp value={item.value} />
            </span>
            <span className="mt-1.5 text-label uppercase text-steel">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
