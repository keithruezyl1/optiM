import { getContractData } from "@/lib/reportData";
import { contractStats } from "@/lib/status";
import { StatGrid, type StatItem } from "@/components/StatGrid";
import { OverdueBanner } from "@/components/OverdueBanner";
import { ContractsTable } from "@/components/ContractsTable";

export const dynamic = "force-dynamic";

const VIEW_LABEL: Record<string, string> = {
  all: "All active contracts",
  overdue: "Contracts with overdue deliverables",
  due_soon: "Contracts with deliverables due this month",
};

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status ?? "all";
  const contracts = await getContractData();
  const stats = contractStats(contracts);

  const overdueContractCount = contracts.filter((c) =>
    c.deliverables.some((d) => d.status === "overdue")
  ).length;

  const scoped =
    status === "overdue"
      ? contracts.filter((c) => c.deliverables.some((d) => d.status === "overdue"))
      : status === "due_soon"
        ? contracts.filter((c) =>
            c.deliverables.some((d) => d.status === "due_soon" || d.days_remaining <= 30)
          )
        : contracts;

  const cards: StatItem[] = [
    { label: "Active Contracts", value: stats.activeContracts, tone: "navy", icon: "briefcase" },
    { label: "Total Deliverables", value: stats.totalDeliverables, tone: "steel", icon: "list-checks" },
    { label: "Overdue", value: stats.overdue, tone: "red", icon: "alert-triangle" },
    { label: "Due This Month", value: stats.dueThisMonth, tone: "amber", icon: "calendar-clock" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-7">
      <header className="mb-6">
        <h1 className="t-h1">Contracts &amp; Deliverables</h1>
        <p className="t-subtitle mt-1">{VIEW_LABEL[status] ?? "All active contracts"}</p>
      </header>

      <OverdueBanner count={stats.overdue} contractCount={overdueContractCount} />

      <div className="mb-7">
        <StatGrid items={cards} />
      </div>

      <ContractsTable contracts={scoped} />
    </div>
  );
}
