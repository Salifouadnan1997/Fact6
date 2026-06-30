import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    const payload = await req.json();

    const event = payload.event;
    const data = payload.data;

    const transactionId = data.id;
    const amount = data.amount;

    const metadata = data.metadata || {};
    const userId = metadata.userId;
    const plan = metadata.plan;

    let statut = "pending";

    if (event === "payment.success") statut = "payé";
    if (event === "payment.failed") statut = "échoué";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    await fetch(
      `${SUPABASE_URL}/rest/v1/payments?id_de_paiement_externe=eq.${transactionId}`,
      {
        method: "PATCH",
        headers: {
          apikey: KEY,
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          statut
        })
      }
    );

    if (event === "payment.success" && userId && plan) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await fetch(`${SUPABASE_URL}/rest/v1/user_subscriptions`, {
        method: "POST",
        headers: {
          apikey: KEY,
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          plan_slug: plan,
          status: "active",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
});
