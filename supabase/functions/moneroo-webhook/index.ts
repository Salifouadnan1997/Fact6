import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    const payload = await req.json();

    const event = payload.event;
    const data = payload.data;

    const transactionId = data.id;
    const amount = data.amount;

    let statut = "pending";

    if (event === "payment.success") {
      statut = "payé";
    }

    if (event === "payment.failed") {
      statut = "échoué";
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/payments?id_de_paiement_externe=eq.${transactionId}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          montant: amount,
          statut: statut,
        }),
      }
    );

    const result = await res.json();

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
