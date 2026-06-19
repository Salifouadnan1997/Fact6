const MONEROO_API_URL = "https://api.moneroo.io/v1";
Deno.serve(() => new Response("FUNCTION IS RUNNING"))

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const payload = {
      amount: Number(body.amount),
      currency: "XOF",
      description: `Abonnement FACTUREset - ${body.plan}`,
      return_url: "https://swhjkrdhmkdwpmmvuuji.supabase.co",

      customer: {
        email: body.customer?.email || "",
        first_name: body.customer?.first_name || "",
        last_name: body.customer?.last_name || ""
      },

      metadata: {
        userId: body.userId,
        plan: body.plan
      }
    };

    const res = await fetch(
console.log("MONEROO KEY CHECK:", {
  sandbox: Deno.env.get("MONEROO_SECRET_SANDBOX")?.substring(0, 15),
  prod: Deno.env.get("MONEROO_SECRET")?.substring(0, 15)
});
      `${MONEROO_API_URL}/payments/initialize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("MONEROO_SECRET_SANDBOX") || Deno.env.get("MONEROO_SECRET")}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();
console.log("MONEROO RESPONSE:", JSON.stringify(data));

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        checkoutUrl: data.checkout_url
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
