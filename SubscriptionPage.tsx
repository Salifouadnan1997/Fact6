import { supabase } from './src/config/supabaseClient';
import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getCurrentPlan, activatePlan } from './payliv1';

interface SubscriptionPageProps {
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  userEmail: string;
  userName: string;
  userId: string;
}

const plans = [
  { 
    id: 'free', 
    name: 'Gratuit', 
    price: 0, 
    currency: 'FCFA',
    period: 'mois',
    features: [
      '5 factures / mois',
      '3 quittances / mois',
      '2 signatures / mois',
      '50 MB stockage',
      'Filigrane plateforme'
    ]
  },
  { 
    id: 'starter', 
    name: 'Starter', 
    price: 5000, 
    currency: 'FCFA',
    period: 'mois',
    features: [
      '200 factures / mois',
      '60 quittances / mois',
      '30 signatures / mois',
      '1 GB stockage',
      'Export PDF',
      'Sans filigrane',
      'Générateur CV IA (5/mois)'
    ]
  },
  { 
    id: 'business', 
    name: 'Business', 
    price: 14900, 
    currency: 'FCFA',
    period: 'mois',
    features: [
      'Factures illimitées',
      'Quittances illimitées',
      '200 signatures / mois',
      '20 GB stockage',
      'Multi-utilisateurs',
      'API',
      'Branding personnalisé',
      'Générateur CV IA illimité'
    ]
  },
  { 
    id: 'enterprise', 
    name: 'Entreprise', 
    price: 0, 
    currency: 'FCFA',
    period: 'mois',
    features: [
      'Tout illimité',
      'Utilisateurs illimités',
      'Stockage illimité',
      'Workflow avancé',
      'Support prioritaire'
    ]
  },
  { 
    id: 'pack_cv_1', 
    name: 'Pack CV (1 CV)', 
    price: 600, 
    currency: 'FCFA',
    period: 'pack',
    features: ['1 CV IA professionnel']
  },
  { 
    id: 'pack_cv_5', 
    name: 'Pack CV (5 CV)', 
    price: 2000, 
    currency: 'FCFA',
    period: 'pack',
    features: ['5 CV IA professionnels']
  },
];

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onTriggerToast, userEmail, userName, userId }) => {
  const [currentPlan, setCurrentPlan] = useState(getCurrentPlan());
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<'success' | 'cancel' | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const planId = params.get('plan');

    if (payment === 'success' && planId) {
      activatePlan(planId);
      setCurrentPlan(getCurrentPlan());
      setPaymentResult('success');
      onTriggerToast('Abonnement activé avec succès !', 'success');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'cancel') {
      setPaymentResult('cancel');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      activatePlan('free');
      setCurrentPlan(getCurrentPlan());
      onTriggerToast('Plan Gratuit activé', 'success');
      return;
    }

    if (planId === 'enterprise') {
      onTriggerToast('Contactez-nous au +2290166336546', 'info');
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch(
        "https://swhjkrdhmkdwpmmvuuji.supabase.co/functions/v1/create-moneroo-paiement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aGprcmRobWtkd3BtbXZ1dWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTQ1OTEsImV4cCI6MjA5NjA5MDU5MX0.9Z_c6RO8W4SyQvZaeOW-0Pj6gIBsrzVer3ozqubXVLs"
          },
          body: JSON.stringify({
            amount: planId === "starter" ? 5000 : planId === "business" ? 14900 : planId === "pack_cv_1" ? 600 : planId === "pack_cv_5" ? 2000 : 20000,
            plan: planId,
            userId: userId,
            customer: {
              email: userEmail,
              first_name: userName.split(" ")[0] || "",
              last_name: userName.split(" ").slice(1).join(" ") || userName.split(" ")[0] || "Client"
            }
          })
        }
      );

      const result = await response.json();

      const checkoutUrl = result.checkoutUrl || result.data?.checkout_url; if (checkoutUrl) {
        window.location.href = checkoutUrl;
        onTriggerToast("Redirection vers le paiement Moneroo...", "info");
      } else {
        onTriggerToast("Erreur: " + JSON.stringify(result), "warning");
        console.error("Erreur Moneroo:", result);
      }
    } catch (error) {
      onTriggerToast("Erreur de connexion: " + (error?.message || "Impossible de contacter le serveur"), "warning");
      console.error("Erreur fetch:", error);
    }

    setLoading(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {paymentResult === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center space-x-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          <div>
            <h3 className="font-bold text-emerald-900">Paiement réussi !</h3>
            <p className="text-xs text-emerald-700">Votre abonnement a été activé.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="border rounded-2xl p-6 flex flex-col">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.id === "starter" && (
                  <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Populaire
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold mt-2">
                {plan.price} {plan.currency}
              </p>
              <p className="text-sm text-gray-500">par {plan.period}</p>
            </div>

            <div className="flex-1 mt-4">
              <ul className="space-y-2 text-sm">
                {plan.features?.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl disabled:bg-gray-400 transition"
            >
              {loading === plan.id ? "Chargement..." : "S'abonner"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
