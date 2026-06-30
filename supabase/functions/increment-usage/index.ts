import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { user_id, metric } = await req.json();

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Vérification quota avant action
  const checkRes = await fetch(`${SUPABASE_URL}/functions/v1/check-quota`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id, metric }),
  });

  const check = await checkRes.json();

  if (!check.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "QUOTA_EXCEEDED",
        used: check.used,
        limit: check.limit
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Incrémentation usage
  await fetch(`${SUPABASE_URL}/rest/v1/usage_stats`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify({
      user_id,
      metric,
      count: 1
    })
  });

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  );
});
