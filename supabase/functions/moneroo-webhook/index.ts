import { serve } from "https://deno.land/std/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    const body = await req.json();

    const event = body?.event || body?.type;
    const data = body?.data;

    if (!data?.id) {
      return new Response("Invalid payload", { status: 400 });
    }

    const allowedEvents = new Set([
      "payment.success",
      "payment.completed",
      "transaction.success"
    ]);

    if (!allowedEvents.has(event)) {
      return new Response("ignored", { status: 200 });
    }

    const transactionId = data.id;
    const amount = Number(data.amount || 0);

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/payments?transaction_id=eq.${transactionId}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          status: "paid",
          amount_paid: amount,
          paid_at: new Date().toISOString()
        })
      }
    );

    const updated = await res.json();

    return new Response(JSON.stringify({
      success: true,
      transactionId,
      updated
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
