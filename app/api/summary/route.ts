import { NextResponse } from "next/server";
import { generateSummary } from "@/lib/openai";
import {
  buildReportData,
  fallbackComplianceSummary,
  staffingSummaryInput,
} from "@/lib/reportData";
import { apiKeyOk, unauthorized } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/summary — AI compliance summary as JSON. Used by the in-app panel
// AND n8n Workflow B (email body). Never fails on the AI: falls back to a
// deterministic computed summary if OpenAI is unavailable.
export async function GET(req: Request) {
  if (!apiKeyOk(req)) return unauthorized();

  try {
    const report = await buildReportData();
    const ai = await generateSummary({
      kind: "compliance",
      data: staffingSummaryInput(report),
    });
    const summary = ai ?? fallbackComplianceSummary(report);
    return NextResponse.json({
      summary,
      source: ai ? "openai" : "fallback",
      generated_at: report.generatedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to build summary.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
