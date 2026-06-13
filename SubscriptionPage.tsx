import { useState, useEffect } from 'react';
import { CreditCard, Check, Sparkles, Crown, Building2, Zap, Shield, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { PLANS, createPayment, getCurrentPlan, activatePlan, formatPrice, checkPaymentStatus } from '../config/payliv';

interface SubscriptionPageProps {
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  userEmail: string;
  userName: string;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onTriggerToast, userEmail, userName }) => {
  const [currentPlan, setCurrentPlan] = useState(getCurrentPlan());
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<'success' | 'cancel' | null>(null);

  // Check URL params for payment result
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

    // Check pending payment
    try {
      const pending = localStorage.getItem('factureset_pending_payment');
      if (pending) {
        const p = JSON.parse(pending);
        const age = Date.now() - new Date(p.created_at).getTime();
        if (age < 86400000) { // < 24h
          checkPaymentStatus(p.short_code).then(res => {
            if (res.is_paid) {
              activatePlan(p.plan_id);
              setCurrentPlan(getCurrentPlan());
              localStorage.removeItem('factureset_pending_payment');
              onTriggerToast('Paiement confirmé ! Plan activé.', 'success');
            }
          });
        } else {
          localStorage.removeItem('factureset_pending_payment');
        }
      }
    } catch {}
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      activatePlan('free');
      setCurrentPlan(getCurrentPlan());
      onTriggerToast('Plan Gratuit activé', 'success');
      return;
    }
    if (planId === 'enterprise') {
      onTriggerToast('Contactez-nous au +2290166336546 pour un devis personnalisé', 'info');
      return;
    }

    setLoading(planId);
    const result = await createPayment(planId, userName, userEmail);
    setLoading(null);

    if (result.success && result.payment_url) {
      onTriggerToast('Redirection vers le paiement...', 'info');
      window.open(result.payment_url, '_blank');
    } else {
      onTriggerToast(result.error || 'Erreur de paiement', 'warning');
    }
  };

  const planIcons = [Zap, Sparkles, Crown, Building2, CreditCard];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Payment Result Banner */}
      {paymentResult === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center space-x-4 animate-fadeIn">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-bold text-emerald-900">Paiement réussi !</h3>
            <p className="text-xs text-emerald-700">Votre abonnement a été activé. Profitez de toutes les fonctionnalités de votre plan.</p>
          </div>
        </div>
      )}
      {paymentResult === 'cancel' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center space-x-4 animate-fadeIn">
          <XCircle className="w-8 h-8 text-amber-600 shrink-0" />
          <div>
            <h3 className="font-bold text-amber-900">Paiement annulé</h3>
            <p className="text-xs text-amber-700">Vous pouvez réessayer à tout moment.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-200">
          <CreditCard className="w-4 h-4" /><span>Abonnements & Tarifs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Choisissez votre plan <span className="text-blue-600">FACTUREset</span>
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Factures, quittances, signatures électroniques et gestion documentaire. Commencez gratuitement, évoluez selon vos besoins.
        </p>
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Shield className="w-4 h-4" />
          <span>Paiement sécurisé via PayLiv — Mobile Money & Carte Bancaire</span>
        </div>
      </div>

      {/* Current Plan Badge */}
      <div className="flex justify-center">
        <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 flex items-center space-x-2">
          <span className="text-xs text-slate-500">Plan actuel :</span>
          <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">{currentPlan.name}</span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {PLANS.map((plan, idx) => {
          const Icon = planIcons[idx];
          const isCurrent = currentPlan.id === plan.id;
          const isUpgrade = PLANS.indexOf(plan) > PLANS.indexOf(currentPlan);

          return (
            <div key={plan.id}
              className={`bg-white rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                plan.popular ? 'border-blue-600 shadow-xl shadow-blue-600/10 scale-[1.02]' : isCurrent ? 'border-emerald-500 shadow-lg' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl">POPULAIRE</div>
              )}
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl">ACTUEL</div>
              )}

              <div className="p-5 space-y-4">
                {/* Plan Header */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: plan.color + '15', color: plan.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                    {plan.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: plan.color + '15', color: plan.color }}>{plan.badge}</span>}
                  </div>
                </div>

                {/* Price */}
                <div className="pt-2">
                  {plan.price > 0 ? (
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-slate-900">{formatPrice(plan.price).replace(' FCFA', '')}</span>
                      <span className="text-xs text-slate-500 font-bold">FCFA / {plan.period}</span>
                    </div>
                  ) : plan.price === 0 ? (
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-slate-900">0</span>
                      <span className="text-xs text-slate-500 font-bold">FCFA / {plan.period}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl font-black text-slate-900">Sur devis</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 pt-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-slate-600">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.color }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="p-5 pt-0">
                {isCurrent ? (
                  <div className="w-full py-3 rounded-xl text-xs font-bold text-center bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Plan actif
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loading}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                        : plan.price <= 0 && plan.id !== 'free'
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {loading === plan.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Redirection...</span></>
                    ) : (
                      <><span>{plan.id === 'enterprise' ? 'Nous contacter' : isUpgrade ? 'Passer au plan' : 'Choisir ce plan'}</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 text-center mb-4">Moyens de paiement acceptés</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {['🟡 MTN Mobile Money', '🟠 Orange Money', '🟢 Moov Money', '🔵 Wave', '💳 Carte Visa/Mastercard'].map((m, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700">{m}</div>
          ))}
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-3">
          Paiements sécurisés par PayLiv — Couverture : Bénin, Côte d'Ivoire, Sénégal, Mali, Togo, Burkina, Niger, Cameroun, RDC, Nigeria, Ghana, Kenya...
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 space-y-1">
        <p>Besoin d'aide ? Contact: <span className="text-blue-600 font-bold">+2290166336546</span></p>
        <p>© 2026 FACTUREset — Plateforme SaaS de gestion des factures et commercial</p>
      </div>
    </div>
  );
};
