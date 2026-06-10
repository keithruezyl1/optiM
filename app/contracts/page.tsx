import { getContractData } from "@/lib/reportData";
import { contractStats } from "@/lib/status";
import { ReadinessStrip, type StripItem } from "@/components/ReadinessStrip";
import { OverdueBanner } from "@/components/OverdueBanner";
import { ContractsTable } from "@/components/ContractsTable";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const contracts = await getContractData();
  const stats = contractStats(contracts);

  const overdueContractCount = new Set(
    contracts
      .filter((c) => c.deliverables.some((d) => d.status === "overdue"))
      .map((c) => c.id)
  ).size;

  const stripItems: StripItem[] = [
    { label: "Active Contracts", value: stats.activeContracts, tone: "ink" },
    { label: "Total Deliverables", value: stats.totalDeliverables, tone: "neutral" },
    { label: "Overdue", value: stats.overdue, tone: "red" },
    { label: "Due This Month", value: stats.dueThisMonth, tone: "amber" },
  ];

  return (
    <>
      {/* Banner sits above the strip (DESIGN_GUIDELINES.md section 4). */}
      <OverdueBanner count={stats.overdue} contractCount={overdueContractCount} />
      <ReadinessStrip items={stripItems} />
      <div className="mx-auto w-full max-w-[1280px] px-6 py-6">
        <ContractsTable contracts={contracts} />
      </div>
    </>
  );
}
