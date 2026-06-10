import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStaffData } from "@/lib/reportData";
import { apiKeyOk, unauthorized } from "@/lib/apiAuth";
import { ROLES, FACILITIES } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/staff — all staff joined with credentials, status computed server-side.
export async function GET(req: Request) {
  if (!apiKeyOk(req)) return unauthorized();
  try {
    const staff = await getStaffData();
    return NextResponse.json(staff);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load staff.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface CreateStaffBody {
  full_name?: string;
  role?: string;
  facility?: string;
  onboarding_status?: string;
  credential_name?: string;
  expires_on?: string;
}

// POST /api/staff — insert a staff member plus one credential. Returns the
// created staff row for the UI.
export async function POST(req: Request) {
  if (!apiKeyOk(req)) return unauthorized();

  let body: CreateStaffBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const full_name = body.full_name?.trim();
  const role = body.role?.trim();
  const facility = body.facility?.trim();
  const credential_name = body.credential_name?.trim();
  const expires_on = body.expires_on?.trim();
  const onboarding_status =
    body.onboarding_status === "in_progress" ? "in_progress" : "complete";

  if (!full_name || !role || !facility || !credential_name || !expires_on) {
    return NextResponse.json(
      { error: "All fields are required: name, role, facility, credential, expiry." },
      { status: 400 }
    );
  }
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    return NextResponse.json({ error: "Unknown role." }, { status: 400 });
  }
  if (!FACILITIES.includes(facility as (typeof FACILITIES)[number])) {
    return NextResponse.json({ error: "Unknown facility." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expires_on)) {
    return NextResponse.json({ error: "Expiry must be YYYY-MM-DD." }, { status: 400 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: staff, error: staffErr } = await supabaseAdmin
      .from("staff")
      .insert({ full_name, role, facility, onboarding_status })
      .select()
      .single();
    if (staffErr) throw staffErr;

    const { error: credErr } = await supabaseAdmin
      .from("credentials")
      .insert({ staff_id: staff.id, credential_name, expires_on });
    if (credErr) throw credErr;

    return NextResponse.json(staff, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create staff member.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
