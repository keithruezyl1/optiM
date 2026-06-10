import { renderToBuffer } from "@react-pdf/renderer";
import { generateSummary } from "@/lib/openai";
import {
  buildReportData,
  executiveSummaryInput,
  fallbackExecutiveSummary,
} from "@/lib/reportData";
import { WeeklyReport } from "@/components/pdf/WeeklyReport";
import { apiKeyOk, unauthorized } from "@/lib/apiAuth";
import React from "react";

// react-pdf requires the Node runtime (not Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function filename(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `OptiM-Weekly-Operations-Report-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.pdf`;
}

// GET /api/report/pdf — the report engine. Same code path for the gold button
// and n8n Workflow B. The AI exec summary falls back to a deterministic string,
// so the PDF never fails to generate on camera.
export async function GET(req: Request) {
  if (!apiKeyOk(req)) return unauthorized();

  try {
    const data = await buildReportData();
    const ai = await generateSummary({
      kind: "executive",
      data: executiveSummaryInput(data),
    });
    const execSummary = ai ?? fallbackExecutiveSummary(data);

    // Cast around @react-pdf's renderToBuffer expecting ReactElement<DocumentProps>;
    // WeeklyReport renders a <Document> but its own props differ structurally.
    const element = React.createElement(WeeklyReport, {
      data,
      execSummary,
    }) as React.ReactElement;
    const buffer = await renderToBuffer(element);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename()}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate report.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
