import { getStaffData } from "@/lib/reportData";
import { staffStats } from "@/lib/status";
import { StatGrid, type StatItem } from "@/components/StatGrid";
import { StaffingView } from "@/components/StaffingView";

export const dynamic = "force-dynamic";

const VIEW_LABEL: Record<string, string> = {
  all: "All staff",
  compliant: "Compliant",
  expiring: "Expiring within 60 days",
  expired: "Expired credentials",
  onboarding: "Onboarding in progress",
};

export default async function StaffingPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status ?? "all";
  const staff = await getStaffData();
  const stats = staffStats(staff);

  const cards: StatItem[] = [
    { label: "Total Staff", value: stats.total, tone: "navy", icon: "users" },
    { label: "Compliant", value: stats.compliant, tone: "green", icon: "shield-check" },
    { label: "Expiring ≤60d", value: stats.expiring, tone: "amber", icon: "clock" },
    { label: "Expired", value: stats.expired, tone: "red", icon: "shield-alert" },
    { label: "Onboarding", value: stats.onboarding, tone: "steel", icon: "user-plus" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-7">
      <header className="mb-6">
        <h1 className="t-h1">Staffing &amp; Credentials</h1>
        <p className="t-subtitle mt-1">
          {VIEW_LABEL[status] ?? "All staff"} · Joint Commission readiness across deployments
        </p>
      </header>

      <div className="mb-7">
        <StatGrid items={cards} />
      </div>

      <StaffingView staff={staff} status={status} />
    </div>
  );
}
