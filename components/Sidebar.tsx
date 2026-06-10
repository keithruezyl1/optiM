"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Users,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { StaffStats, ContractStats } from "@/lib/types";
import { GenerateReportButton } from "./GenerateReportButton";

// Collapsible sidebar: a dark icon rail (always visible) plus an expandable
// white panel with nested status views whose counts double as filters. Replaces
// the old header + tab rail. Selecting a status navigates via a URL query param
// the pages read, so the nav is shareable and survives reload.

interface NavLeaf {
  label: string;
  status: string; // "all" | "expiring" | ...
  count: number;
  tone?: "red" | "amber" | "green" | "steel";
}

export function Sidebar({
  staffStats,
  contractStats,
}: {
  staffStats: StaffStats;
  contractStats: ContractStats;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();
  const currentStatus = params.get("status") ?? "all";

  const onStaffing = pathname === "/";
  const onContracts = pathname === "/contracts";

  const staffingLeaves: NavLeaf[] = [
    { label: "All", status: "all", count: staffStats.total },
    { label: "Compliant", status: "compliant", count: staffStats.compliant, tone: "green" },
    { label: "Expiring", status: "expiring", count: staffStats.expiring, tone: "amber" },
    { label: "Expired", status: "expired", count: staffStats.expired, tone: "red" },
    { label: "Onboarding", status: "onboarding", count: staffStats.onboarding, tone: "steel" },
  ];
  const contractLeaves: NavLeaf[] = [
    { label: "All", status: "all", count: contractStats.activeContracts },
    { label: "Overdue", status: "overdue", count: contractStats.overdue, tone: "red" },
    { label: "Due this month", status: "due_soon", count: contractStats.dueThisMonth, tone: "amber" },
  ];

  const TONE_DOT: Record<string, string> = {
    red: "#C0392B",
    amber: "#C77D1F",
    green: "#1F7A4D",
    steel: "#5B6B82",
  };

  function leafHref(base: string, status: string) {
    return status === "all" ? base : `${base}?status=${status}`;
  }

  function NavGroup({
    title,
    base,
    active,
    leaves,
  }: {
    title: string;
    base: string;
    active: boolean;
    leaves: NavLeaf[];
  }) {
    return (
      <div className="mb-5">
        <div className="px-3 pb-1.5 text-label uppercase tracking-wide text-steel">{title}</div>
        <ul className="flex flex-col">
          {leaves.map((leaf) => {
            const isActive = active && currentStatus === leaf.status;
            return (
              <li key={leaf.status}>
                <Link
                  href={leafHref(base, leaf.status)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center justify-between rounded-lg py-2 pl-6 pr-3 text-ui transition-colors duration-150 ease-ops ${
                    isActive
                      ? "bg-navy-900/[0.06] font-semibold text-navy-900"
                      : "text-ink/80 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: leaf.tone ? TONE_DOT[leaf.tone] : "#C2CBD8",
                      }}
                      aria-hidden
                    />
                    {leaf.label}
                  </span>
                  <span
                    className={`min-w-6 rounded-md px-1.5 text-center text-[12px] tabular-nums ${
                      isActive ? "bg-navy-900 text-white" : "bg-slate-100 text-steel"
                    }`}
                  >
                    {leaf.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <aside className="sticky top-0 flex h-screen shrink-0 self-start">
      {/* Icon rail */}
      <div className="flex w-16 flex-col items-center justify-between bg-navy-900 py-4">
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            aria-label="OptiM home"
            className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] font-condensed text-[22px] font-bold text-gold"
          >
            M
          </Link>
          <RailIcon href="/" active={onStaffing} label="Staffing">
            <Users size={20} />
          </RailIcon>
          <RailIcon href="/contracts" active={onContracts} label="Contracts">
            <Briefcase size={20} />
          </RailIcon>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-steel transition-colors duration-150 hover:bg-white/[0.08] hover:text-white"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Expandable panel */}
      {!collapsed && (
        <div className="flex w-60 flex-col border-r border-border bg-white">
          <div className="px-5 pb-4 pt-5">
            <div className="font-condensed text-[24px] font-bold leading-none tracking-tight text-ink">
              Opti<span className="text-gold">M</span>
            </div>
            <div className="mt-1 text-label uppercase tracking-wide text-steel">
              Operations
            </div>
          </div>

          <div className="px-3 pb-4">
            <GenerateReportButton block />
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-6">
            <NavGroup title="Staffing" base="/" active={onStaffing} leaves={staffingLeaves} />
            <NavGroup
              title="Contracts"
              base="/contracts"
              active={onContracts}
              leaves={contractLeaves}
            />
          </nav>

          <div className="border-t border-border px-5 py-3 text-label uppercase tracking-wide text-steel">
            JVM Solutions
          </div>
        </div>
      )}
    </aside>
  );
}

function RailIcon({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 ease-ops ${
        active ? "bg-gold text-navy-900" : "text-white/70 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
