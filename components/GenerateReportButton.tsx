"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

// The single gold action, visible from every tab. Fetches the PDF from
// /api/report/pdf (same engine n8n calls) and downloads it. Never visibly
// fails in a way that dead-ends the demo: the route itself falls back to a
// deterministic summary, and any transport error surfaces as a specific,
// dismissible message rather than a crash.
function todayStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function GenerateReportButton() {
  const [state, setState] = useState<"idle" | "generating" | "error">("idle");

  async function handleClick() {
    setState("generating");
    try {
      const res = await fetch("/api/report/pdf", { cache: "no-store" });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OptiM-Weekly-Operations-Report-${todayStamp()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "generating"}
        className="inline-flex items-center gap-2 rounded-card bg-gold px-4 py-2 text-ui font-semibold text-navy-900 transition-colors duration-150 ease-ops hover:bg-[#A6851F] disabled:cursor-wait disabled:opacity-80"
      >
        {state === "generating" ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Generating…
          </>
        ) : (
          <>
            <FileDown size={16} aria-hidden />
            Generate weekly report
          </>
        )}
      </button>

      {state === "error" && (
        <div
          role="alert"
          className="absolute right-0 top-full z-10 mt-2 w-72 rounded-card border-l-[3px] border-signal-red bg-white p-3 text-table text-ink shadow-card"
        >
          Report generation failed — the server didn’t return a PDF.{" "}
          <button
            type="button"
            onClick={handleClick}
            className="font-semibold text-navy-700 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
