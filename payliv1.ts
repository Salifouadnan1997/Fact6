// ═══════════════════════════════════════════════════════════════
// PayLiv Payment Gateway Integration for FACTUREset (FIXED)
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://swhjkrdhmkdwpmmvuuji.supabase.co';
const API_KEY = import.meta.env.VITE_PAYLIV_API_KEY;
export const PUBLIC_KEY = import.meta.env.VITE_PAYLIV_PUBLIC_KEY;

export interface PaylivPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  badge?: string;
  color: string;
  popular?: boolean;
}

export const PLANS: PaylivPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'FCFA',
    period: 'mois',
    badge: 'Essai',
    color: '#64748b',
    features: [
      '5 factures / mois',
      '3 quittances / mois',
      '2 signatures / mois',
      '50 MB stockage',
      'Filigrane plateforme',
      '❌ Générateur CV non inclus'
    ],
  },

  {
    id: 'starter',
    name: 'Starter',
    price: 5000,
    currency: 'FCFA',
    period: 'mois',
    badge: 'Populaire',
    color: '#2563eb',
    popular: true,
    features: [
      '200 factures / mois',
      '60 quittances / mois',
      '30 signatures / mois',
      '1 GB stockage',
      'Export PDF',
      'Sans filigrane',
      '🤖 Générateur CV IA (5/mois)'
    ],
  },

  {
    id: 'business',
    name: 'Business',
    price: 14900,
    currency: 'FCFA',
    period: 'mois',
    badge: 'Pro',
    color: '#7c3aed',
    features: [
      'Factures illimitées',
      'Quittances illimitées',
      '200 signatures / mois',
      '20 GB stockage',
      'Multi-utilisateurs',
      'API',
      'Branding personnalisé',
      'Sauvegarde cloud',
      '🤖 Générateur CV IA illimité'
    ],
  },

  {
    id: 'enterprise',
    name: 'Entreprise',
    price: -1,
    currency: 'FCFA',
    period: 'mois',
    badge: 'Sur devis',
    color: '#0f172a',
    features: [
      'Tout illimité',
      'Utilisateurs illimités',
      'Stockage illimité',
      'Workflow avancé',
      'Hébergement dédié',
      'Intégration ERP/CRM',
      'Support prioritaire',
      '🤖 Générateur CV IA illimité'
    ],
  },

  {
    id: 'pack_cv_1',
    name: 'Pack CV (1 CV)',
    price: 600,
    currency: 'FCFA',
    period: 'pack',
    badge: '📄 1 CV',
    color: '#059669',
    features: [
      '1 CV IA professionnel'
    ],
  },

  {
    id: 'pack_cv_5',
    name: 'Pack CV (5 CV)',
    price: 2000,
    currency: 'FCFA',
    period: 'pack',
    badge: '📄 5 CV',
    color: '#059669',
    features: [
      '5 CV IA professionnels'
    ],
  },
];

// ═══ API FUNCTIONS ═══

export async function createPayment(
  planId: string,
  customerName: string,
  customerEmail: string
): Promise<{ success: boolean; payment_url?: string; error?: string }> {

  const plan = PLANS.find(p => p.id === planId);

  if (!plan || (plan.price < 0 && plan.id !== 'enterprise')) {
    return { success: false, error: 'Plan invalide' };
  }

  try {
    const res = await fetch(`${API_BASE}/api-payments-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        amount: plan.price === -1 ? 0 : plan.price,
        currency: plan.currency,
        title: `FACTUREset - Abonnement ${plan.name}`,
        description: `Abonnement au plan ${plan.name}`,
        customer_name: customerName,
        customer_email: customerEmail,
        success_url: window.location.origin + '?payment=success&plan=' + planId,
        cancel_url: window.location.origin + '?payment=cancel',
        webhook_url: window.location.origin + '/api/webhook',
        metadata: {
          plan_id: planId,
          plan_name: plan.name,
          type: 'subscription'
        },
        expires_in_hours: 24,
      }),
    });

    const data = await res.json();

    if (data.payment_url) {
      localStorage.setItem('factureset_pending_payment', JSON.stringify({
        short_code: data.short_code,
        plan_id: planId,
        created_at: new Date().toISOString(),
      }));

      return { success: true, payment_url: data.payment_url };
    }

    return {
      success: false,
      error: data.message || 'Erreur de création du paiement'
    };

  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function checkPaymentStatus(shortCode: string) {
  try {
    const res = await fetch(
      `${API_BASE}/api-payments-status?short_code=${shortCode}`,
      {
        headers: { 'X-API-Key': API_KEY },
      }
    );

    const data = await res.json();

    return {
      success: true,
      is_paid: data.is_paid,
      status: data.status
    };

  } catch (e) {
    return {
      success: false,
      error: (e as Error).message
    };
  }
}

export function getCurrentPlan(): PaylivPlan {
  try {
    const stored = localStorage.getItem('factureset_subscription');

    if (stored) {
      const sub = JSON.parse(stored);
      const plan = PLANS.find(p => p.id === sub.plan_id);
      if (plan) return plan;
    }
  } catch {}

  return PLANS[0];
}

export function activatePlan(planId: string) {
  localStorage.setItem('factureset_subscription', JSON.stringify({
    plan_id: planId,
    activated_at: new Date().toISOString(),
    status: 'active',
  }));
}

export function formatPrice(amount: number): string {
  if (amount === 0) return '0 FCFA';
  if (amount < 0) return 'Sur devis';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(amount);
}