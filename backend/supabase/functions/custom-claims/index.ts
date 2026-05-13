import { createClient } from "jsr:@supabase/supabase-js@2";

// ── Safe response — always returns valid JSON, never blocks login ─────────────
const safeResponse = (appMetadata: Record<string, unknown> = {}) =>
  new Response(
    JSON.stringify({ app_metadata: appMetadata }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );

Deno.serve(async (req: Request) => {
  // ── Wrap EVERYTHING in try/catch — login must never be blocked ────────────
  try {

    // ── Only handle POST requests ─────────────────────────────────────────
    if (req.method !== "POST") {
      return safeResponse();
    }

    // ── Parse the webhook payload safely ─────────────────────────────────
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      console.error("custom-claims: failed to parse request body");
      return safeResponse();
    }

    // ── Get user from payload ─────────────────────────────────────────────
    const userId = payload?.user?.id || payload?.record?.id;
    const userEmail = payload?.user?.email || payload?.record?.email;

    if (!userId) {
      console.error("custom-claims: no user id in payload", JSON.stringify(payload));
      return safeResponse();
    }

    // ── Check env vars exist ──────────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("custom-claims: missing env vars");
      return safeResponse();
    }

    // ── Create service-role client ────────────────────────────────────────
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // ── Look up user's company and role ───────────────────────────────────
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("company_id, role")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error("custom-claims: user_roles query error:", roleError.message);
      // Don't block login — just no company context
      return safeResponse();
    }

    if (!roleData) {
      // User has no company assigned yet — allow login, admin assigns later
      console.log(`custom-claims: ${userEmail} has no company assignment`);
      return safeResponse({ company_id: null, role: "none" });
    }

    // ── Success — inject company_id and role into JWT ─────────────────────
    console.log(`custom-claims: ${userEmail} → company ${roleData.company_id} (${roleData.role})`);
    return safeResponse({
      company_id: roleData.company_id,
      role: roleData.role,
    });

  } catch (err) {
    // ── Last resort — log and allow login ────────────────────────────────
    console.error("custom-claims: unexpected error:", err);
    return safeResponse();
  }
});
