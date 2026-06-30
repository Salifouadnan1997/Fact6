#!/bin/bash

# URL de ta fonction Supabase
SUPABASE_URL="https://swhjkrdhmkdwpmmvuuji.supabase.co/functions/v1/create-moneroo-paiement"

# Remplace la fonction handleSubscribe
sed -i '/const handleSubscribe = async (planId: string) => {/,/};/c\
const handleSubscribe = async (planId: string) => {\
  if (planId === "free") {\
    activatePlan("free");\
    setCurrentPlan(getCurrentPlan());\
    onTriggerToast("Plan Gratuit activé", "success");\
    return;\
  }\
\
  if (planId === "enterprise") {\
    onTriggerToast("Contactez-nous au +2290166336546 pour un devis personnalisé", "info");\
    return;\
  }\
\
  setLoading(planId);\
\
  try {\
    const response = await fetch("'${SUPABASE_URL}'", {\
      method: "POST",\
      headers: {\
        "Content-Type": "application/json",\
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aGprcmRobWtkd3BtbXZ1dWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTQ1OTEsImV4cCI6MjA5NjA5MDU5MX0.9Z_c6RO8W4SyQvZaeOW-0Pj6gIBsrzVer3ozqubXVLs"\
      },\
      body: JSON.stringify({\
        amount: planId === "basic" ? 5000 : planId === "pro" ? 10000 : 20000,\
        plan: planId,\
        userId: userEmail,\
        customer: {\
          email: userEmail,\
          first_name: userName.split(" ")[0] || "",\
          last_name: userName.split(" ").slice(1).join(" ") || ""\
        }\
      })\
    });\
\
    const result = await response.json();\
\
    if (result.checkoutUrl) {\
      window.open(result.checkoutUrl, "_blank");\
      onTriggerToast("Redirection vers le paiement Moneroo...", "info");\
    } else {\
      onTriggerToast(result.error || "Erreur lors de la création du paiement", "warning");\
    }\
  } catch (error) {\
    onTriggerToast("Erreur de connexion au serveur de paiement", "warning");\
  }\
\
  setLoading(null);\
};' SubscriptionPage.tsx

echo "✅ Patch appliqué avec succès !"
