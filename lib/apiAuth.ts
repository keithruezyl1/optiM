// Optional x-api-key gate. Enforced ONLY when OPTIM_API_KEY is set, so the demo
// runs open while Keith can honestly say "secured by key in production." n8n
// would send the matching header.
export function apiKeyOk(req: Request): boolean {
  const expected = process.env.OPTIM_API_KEY;
  if (!expected) return true; // gate disabled for the demo
  return req.headers.get("x-api-key") === expected;
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Invalid or missing x-api-key." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
