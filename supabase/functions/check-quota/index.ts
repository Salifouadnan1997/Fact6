import { serve } from "https://deno.land/std/http/server.ts";

serve(async (_req: Request) => {
  return new Response(
    JSON.stringify({
      allowed: true,
      can_generate: true,
      unlimited: true,
      message: "Génération autorisée sans abonnement ni quota."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
});
