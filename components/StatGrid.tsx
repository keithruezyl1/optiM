"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import {
  Users,
  ShieldCheck,
  Clock,
  ShieldAlert,
  UserPlus,
  Briefcase,
  ListChecks,
  AlertTriangle,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";

// Glossy gradient stat cards in a responsive grid. Icon top-left, huge serif
// numeral bottom-left, label beneath. Gradient color is keyed to meaning, so
// color still carries status. Numerals count up once on load (reduced-motion
// safe). Replaces the flat Readiness Strip while keeping its signature role.

export type StatTone = "navy" | "green" | "amber" | "red" | "steel";
export type StatIcon =
  | "users"
  | "shield-check"
  | "clock"
  | "shield-alert"
  | "user-plus"
  | "briefcase"
  | "list-checks"
  | "alert-triangle"
  | "calendar-clock";

export interface StatItem {
  label: string;
  value: number;
  tone: StatTone;
  icon: StatIcon;
}

const ICONS: Record<StatIcon, LucideIcon> = {
  users: Users,
  "shield-check": ShieldCheck,
  clock: Clock,
  "shield-alert": ShieldAlert,
  "user-plus": UserPlus,
  briefcase: Briefcase,
  "list-checks": ListChecks,
  "alert-triangle": AlertTriangle,
  "calendar-clock": CalendarClock,
};

const GRADIENT: Record<StatTone, { from: string; to: string; shadow: string }> = {
  navy: { from: "#1E4A7E", to: "#0B1F3A", shadow: "rgba(11,31,58,.40)" },
  green: { from: "#2BA66B", to: "#1B6B43", shadow: "rgba(31,122,77,.40)" },
  amber: { from: "#DBA13F", to: "#B0681A", shadow: "rgba(176,104,26,.40)" },
  red: { from: "#D24A3B", to: "#9E2C25", shadow: "rgba(160,44,42,.40)" },
  steel: { from: "#71849E", to: "#48566A", shadow: "rgba(72,86,106,.38)" },
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
      duration: 0.7,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduced]);
  return <>{display}</>;
}

function StatCard({ item }: { item: StatItem }) {
  const g = GRADIENT[item.tone];
  const Icon = ICONS[item.icon];
  return (
    <div
      className="relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-2xl p-4 text-white"
      style={{
        background: `linear-gradient(150deg, ${g.from} 0%, ${g.to} 100%)`,
        boxShadow: `0 12px 28px -10px ${g.shadow}, inset 0 1px 0 rgba(255,255,255,.22)`,
      }}
    >
      {/* glossy sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 45%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full"
        style={{ background: "rgba(255,255,255,.10)" }}
      />

      <div className="relative flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
          <Icon size={18} aria-hidden />
        </span>
      </div>

      <div className="relative">
        <div className="font-serif text-stat font-semibold tabular-nums tracking-tight">
          <CountUp value={item.value} />
        </div>
        <div className="mt-1 text-label uppercase text-white/75">{item.label}</div>
      </div>
    </div>
  );
}

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(176px, 1fr))" }}
    >
      {items.map((it) => (
        <StatCard key={it.label} item={it} />
      ))}
    </div>
  );
}
