import "server-only";
import OpenAI from "openai";

// Server-side only. The key never reaches the browser. Model is gpt-4o-mini
// (cheap, fast, sufficient for short operational summaries).

const apiKey = process.env.OPENAI_API_KEY;

const client = apiKey ? new OpenAI({ apiKey }) : null;

const SYSTEM_PROMPT =
  "You are an operations analyst for a federal healthcare staffing contractor. " +
  "Be specific: name counts, roles, facilities, and the most urgent items. " +
  "No preamble, no bullet points, no markdown. Plain operational English.";

interface SummaryRequest {
  /** "compliance" => 3-5 sentences, staffing only. "executive" => 4-6 sentences, staffing + contracts. */
  kind: "compliance" | "executive";
  /** JSON-serializable operational data the model summarizes. */
  data: unknown;
}

/**
 * Returns a generated summary string, or null if OpenAI is unavailable or
 * errors. Callers MUST supply a deterministic fallback so the UI/PDF never
 * visibly fail (ARCHITECTURE.md section 5). All errors are swallowed here.
 */
export async function generateSummary({
  kind,
  data,
}: SummaryRequest): Promise<string | null> {
  if (!client) return null;

  const instruction =
    kind === "compliance"
      ? "Write a 3-5 sentence compliance summary of the staffing data below."
      : "Write a 4-6 sentence executive summary for leadership covering BOTH staffing compliance and contract deliverable status, from the data below.";

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 350,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${instruction}\n\n${JSON.stringify(data)}` },
      ],
    });
    const text = completion.choices[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  }
}
