"use client";

import { useEffect, useRef, useState } from "react";
import { ListFilter, Check, Search } from "lucide-react";

// A column-header filter trigger + popover. The header label is the trigger;
// a funnel icon marks it filterable and shows a gold dot when a filter is set.
// Three kinds: free text, single-choice, multi-choice.

type Option = { value: string; label: string };

type Props =
  | { kind: "text"; label: string; active: boolean; value: string; onChange: (v: string) => void; align?: "left" | "right" }
  | { kind: "single"; label: string; active: boolean; value: string; options: Option[]; onChange: (v: string) => void; align?: "left" | "right" }
  | { kind: "multi"; label: string; active: boolean; value: string[]; options: string[]; onChange: (v: string[]) => void; align?: "left" | "right" };

export function ColumnFilter(props: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group inline-flex items-center gap-1.5 text-label uppercase tracking-wide text-steel transition-colors duration-150 hover:text-navy-900"
      >
        {props.label}
        <span className="relative">
          <ListFilter size={13} className={props.active ? "text-gold" : "text-steel/60 group-hover:text-navy-900"} />
          {props.active && (
            <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-gold" />
          )}
        </span>
      </button>

      {open && (
        <div
          className={`absolute z-30 mt-2 min-w-[200px] rounded-card border border-border bg-white p-2 shadow-card ${
            props.align === "right" ? "right-0" : "left-0"
          }`}
        >
          {props.kind === "text" && (
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-steel" />
              <input
                autoFocus
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                placeholder={`Filter ${props.label.toLowerCase()}`}
                className="w-full rounded-md border border-border py-1.5 pl-8 pr-2 text-ui text-ink placeholder:text-steel"
              />
            </div>
          )}

          {props.kind === "single" && (
            <ul className="flex flex-col">
              {props.options.map((opt) => {
                const selected = props.value === opt.value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        props.onChange(opt.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-ui hover:bg-slate-100 ${
                        selected ? "font-semibold text-navy-900" : "text-ink"
                      }`}
                    >
                      {opt.label}
                      {selected && <Check size={14} className="text-gold" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {props.kind === "multi" && (
            <ul className="flex max-h-64 flex-col overflow-y-auto">
              {props.options.map((opt) => {
                const checked = props.value.includes(opt);
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() =>
                        props.onChange(
                          checked ? props.value.filter((v) => v !== opt) : [...props.value, opt]
                        )
                      }
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-ui text-ink hover:bg-slate-100"
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          checked ? "border-gold bg-gold text-navy-900" : "border-border"
                        }`}
                      >
                        {checked && <Check size={11} />}
                      </span>
                      {opt}
                    </button>
                  </li>
                );
              })}
              {props.value.length > 0 && (
                <li className="mt-1 border-t border-border pt-1">
                  <button
                    type="button"
                    onClick={() => props.onChange([])}
                    className="w-full rounded-md px-2 py-1.5 text-left text-table text-steel hover:bg-slate-100"
                  >
                    Clear
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
