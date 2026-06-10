"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Horizontal tab rail under the header. Active tab underlined in gold.
const TABS = [
  { href: "/", label: "Staffing" },
  { href: "/contracts", label: "Contracts" },
];

export function TabRail() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-border bg-white">
      <div className="mx-auto flex w-full max-w-[1280px] gap-1 px-6">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative -mb-px border-b-2 px-4 py-3 text-ui font-medium transition-colors duration-150 ease-ops ${
                active
                  ? "border-gold text-navy-900"
                  : "border-transparent text-steel hover:text-navy-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
