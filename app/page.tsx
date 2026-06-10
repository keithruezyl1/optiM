import { getStaffData } from "@/lib/reportData";
import { staffStats } from "@/lib/status";
import { ReadinessStrip, type StripItem } from "@/components/ReadinessStrip";
import { StaffingView } from "@/components/StaffingView";

// Staffing & Credential Tracker — the default tab and centerpiece.
// Always fetch fresh so the demo reflects live writes immediately.
export const dynamic = "force-dynamic";

export default async function StaffingPage() {
  const staff = await getStaffData();
  const stats = staffStats(staff);

  const stripItems: StripItem[] = [
    { label: "Total Staff", value: stats.total, tone: "ink" },
    { label: "Compliant", value: stats.compliant, tone: "green" },
    { label: "Expiring ≤60d", value: stats.expiring, tone: "amber" },
    { label: "Expired", value: stats.expired, tone: "red" },
    { label: "Onboarding", value: stats.onboarding, tone: "neutral" },
  ];

  return (
    <>
      <ReadinessStrip items={stripItems} />
      <div className="mx-auto w-full max-w-[1280px] px-6 py-6">
        <StaffingView staff={staff} />
      </div>
    </>
  );
}
