import { serve } from "https://deno.land/std/http/server.ts";

serve(async (_req: Request) => {
  return new Response(
    JSON.stringify({
      success: true,
      incremented: false,
      unlimited: true,
      message: "Comptage des quotas désactivé."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
});
