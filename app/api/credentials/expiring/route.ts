import { NextResponse } from "next/server";
import { getStaffData } from "@/lib/reportData";
import { apiKeyOk, unauthorized } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/credentials/expiring?days=60
// Flat list of credentials at or within the window (includes already-expired,
// which are the most urgent), sorted by days_remaining ascending. Consumed by
// n8n Workflow A (the daily watchdog).
export async function GET(req: Request) {
  if (!apiKeyOk(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 60);
  const window = Number.isFinite(days) && days > 0 ? days : 60;

  try {
    const staff = await getStaffData();
    const rows = staff
      .flatMap((s) =>
        s.credentials.map((c) => ({
          full_name: s.full_name,
          role: s.role,
          facility: s.facility,
          credential_name: c.credential_name,
          expires_on: c.expires_on,
          days_remaining: c.days_remaining,
        }))
      )
      .filter((c) => c.days_remaining <= window)
      .sort((a, b) => a.days_remaining - b.days_remaining);

    return NextResponse.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load credentials.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
