import { deliverablePillLabel } from "@/lib/status";
import type { ComputedContract, DeliverableStatus } from "@/lib/types";
import { StatusPill, type PillTone } from "./StatusPill";

const DELIVERABLE_TONE: Record<DeliverableStatus, PillTone> = {
  overdue: "red",
  due_soon: "amber",
  on_track: "green",
};

const DELIVERABLE_BORDER: Record<DeliverableStatus, string> = {
  overdue: "#C0392B",
  due_soon: "#C77D1F",
  on_track: "transparent",
};

function formatValue(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

function formatPop(start: string | null, end: string | null): string {
  const fmt = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  if (!start || !end) return "—";
  return `${fmt(start)} – ${fmt(end)}`;
}

export function ContractsTable({ contracts }: { contracts: ComputedContract[] }) {
  return (
    <div className="flex flex-col gap-5">
      {contracts.map((c) => (
        <div
          key={c.id}
          className="overflow-hidden rounded-card border border-border bg-white shadow-card"
        >
          {/* Contract header */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-steel tnum">
                  {c.contract_number}
                </span>
                <StatusPill tone="green" label={c.status.toUpperCase()} />
              </div>
              <h3 className="mt-1 text-section font-semibold text-navy-900">{c.name}</h3>
              <p className="mt-0.5 text-table text-steel">{c.client_agency}</p>
            </div>
            <div className="text-right">
              <div className="font-condensed text-[22px] font-semibold text-ink tnum">
                {formatValue(c.value_usd)}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-steel tnum">
                {formatPop(c.pop_start, c.pop_end)}
              </div>
            </div>
          </div>

          {/* Deliverables. table-fixed + shared column widths so every contract
              card lines up column-for-column. */}
          <table className="w-full table-fixed border-collapse text-table">
            <colgroup>
              <col className="w-[46%]" />
              <col className="w-[22%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border text-left text-label uppercase text-steel">
                <th className="px-5 py-2.5 font-semibold">Deliverable</th>
                <th className="px-5 py-2.5 font-semibold">Owner</th>
                <th className="px-5 py-2.5 text-right font-semibold">Due</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {c.deliverables.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-b-0">
                  <td
                    className="px-5 py-2.5 text-ink"
                    style={{ boxShadow: `inset 3px 0 0 ${DELIVERABLE_BORDER[d.status]}` }}
                  >
                    {d.title}
                    {d.completed && (
                      <span className="ml-2 text-[11px] uppercase text-ops-green">done</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-ink">{d.owner}</td>
                  <td className="px-5 py-2.5 text-right">
                    <span className="font-mono text-[12px] text-ink tnum">
                      {(() => {
                        const [y, m, day] = d.due_on.split("-").map(Number);
                        return new Date(y, m - 1, day).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      })()}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <StatusPill tone={DELIVERABLE_TONE[d.status]} label={deliverablePillLabel(d)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
