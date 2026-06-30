import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { user_id, metric } = await req.json();

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const subRes = await fetch(
    `${SUPABASE_URL}/rest/v1/user_subscriptions?user_id=eq.${user_id}&status=eq.active`,
    {
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
      },
    }
  );

  const sub = await subRes.json();
  const planSlug = sub?.[0]?.plan_slug;

  const planRes = await fetch(
    `${SUPABASE_URL}/rest/v1/plans?slug=eq.${planSlug}`,
    {
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
      },
    }
  );

  const plan = await planRes.json();
  const quotas = plan?.[0]?.quotas || {};

  const limit = quotas?.[metric];

  if (limit === -1) {
    return new Response(JSON.stringify({ allowed: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const usageRes = await fetch(
    `${SUPABASE_URL}/rest/v1/usage_stats?user_id=eq.${user_id}&metric=eq.${metric}`,
    {
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
      },
    }
  );

  const usage = await usageRes.json();
  const count = usage?.[0]?.count || 0;

  return new Response(
    JSON.stringify({
      allowed: count < limit,
      used: count,
      limit,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
