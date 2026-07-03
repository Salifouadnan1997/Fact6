import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { user_id, metric } = await req.json();

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 1. Chercher l'abonnement actif de l'utilisateur
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
  
  // CORRECTION : Si aucun abonnement n'est trouvé, on lui attribue le slug 'free' par défaut
  const planSlug = sub?.[0]?.plan_slug || 'free';

  // 2. Récupérer les quotas du plan
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

  let limit = quotas?.[metric];

  // CORRECTION : Si la limite n'est pas définie en BDD pour le plan free, on donne 5 factures gratuites par défaut
  if (limit === undefined) {
    limit = 5; 
  }

  // Si le plan est illimité (-1)
  if (limit === -1) {
    return new Response(JSON.stringify({ allowed: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // 3. Récupérer la consommation actuelle de l'utilisateur
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

  // L'utilisateur est autorisé tant que sa consommation est inférieure à sa limite
  return new Response(
    JSON.stringify({
      allowed: count < limit,
      used: count,
      limit,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
