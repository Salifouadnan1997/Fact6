import { useState, useEffect } from 'react';
import { Users, Copy, DollarSign, ArrowUpRight, Clock, CheckCircle2, Wallet, Share2, Gift, TrendingUp } from 'lucide-react';

interface AffiliationProps {
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  userEmail: string;
  userName: string;
}

interface Referral {
  id: string;
  name: string;
  email: string;
  date: string;
  plan: string;
  earned: number;
  status: 'active' | 'pending';
}

interface Withdrawal {
  id: string;
  amount: number;
  phone: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const Affiliation: React.FC<AffiliationProps> = ({ onTriggerToast }) => {
  const [affiliateCode] = useState(() => {
    let code = localStorage.getItem('factureset_affiliate_code');
    if (!code) { code = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(); localStorage.setItem('factureset_affiliate_code', code); }
    return code;
  });

  const [momoNumber, setMomoNumber] = useState(() => localStorage.getItem('factureset_momo') || '');
  const [momoSaved, setMomoSaved] = useState(!!localStorage.getItem('factureset_momo'));
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [referrals] = useState<Referral[]>(() => {
    try { const s = localStorage.getItem('factureset_referrals'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => {
    try { const s = localStorage.getItem('factureset_withdrawals'); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const affiliateLink = `${window.location.origin}?ref=${affiliateCode}`;
  const totalEarned = referrals.reduce((s, r) => s + r.earned, 0);
  const totalWithdrawn = withdrawals.filter(w => w.status === 'completed').reduce((s, w) => s + w.amount, 0);
  const balance = totalEarned - totalWithdrawn;
  const activeReferrals = referrals.filter(r => r.status === 'active').length;

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink).then(() => onTriggerToast('Lien copié !', 'success')).catch(() => {});
  };
  const copyCode = () => {
    navigator.clipboard.writeText(affiliateCode).then(() => onTriggerToast('Code copié !', 'success')).catch(() => {});
  };

  const saveMomo = () => {
    if (!momoNumber.trim() || momoNumber.length < 8) { onTriggerToast('Numéro invalide', 'warning'); return; }
    localStorage.setItem('factureset_momo', momoNumber);
    setMomoSaved(true);
    onTriggerToast('Numéro Mobile Money enregistré !', 'success');
  };

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0) { onTriggerToast('Montant invalide', 'warning'); return; }
    if (withdrawAmount > balance) { onTriggerToast('Solde insuffisant', 'warning'); return; }
    if (!momoSaved) { onTriggerToast('Enregistrez votre numéro Mobile Money d\'abord', 'warning'); return; }

    setWithdrawLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));

    const newW: Withdrawal = {
      id: `WD-${Date.now()}`,
      amount: withdrawAmount,
      phone: momoNumber,
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'pending',
    };
    const updated = [newW, ...withdrawals];
    setWithdrawals(updated);
    localStorage.setItem('factureset_withdrawals', JSON.stringify(updated));
    setWithdrawLoading(false);
    setShowWithdraw(false);
    setWithdrawAmount(0);
    onTriggerToast(`Retrait de ${fmt(withdrawAmount)} en cours de traitement...`, 'success');

    // Simulate completion after 3s
    setTimeout(() => {
      const completed = updated.map(w => w.id === newW.id ? { ...w, status: 'completed' as const } : w);
      setWithdrawals(completed);
      localStorage.setItem('factureset_withdrawals', JSON.stringify(completed));
      onTriggerToast(`Retrait de ${fmt(withdrawAmount)} envoyé au ${momoNumber} !`, 'success');
    }, 3000);
  };

  // Check URL for referral tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) { localStorage.setItem('factureset_referred_by', ref); }
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl border border-purple-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-extrabold tracking-tight">Programme d'Affiliation</h1>
            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">30% de commission</span>
          </div>
          <p className="text-xs text-slate-300 max-w-lg">Partagez FACTUREset et gagnez 30% sur chaque abonnement payé par vos filleuls. Retirez vos gains sur Mobile Money à tout moment.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2"><Users className="w-5 h-5 text-blue-600" /></div>
          <p className="text-2xl font-black text-slate-900">{referrals.length}</p>
          <p className="text-[10px] text-slate-500">Filleuls total</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
          <p className="text-2xl font-black text-slate-900">{activeReferrals}</p>
          <p className="text-[10px] text-slate-500">Filleuls actifs</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
          <p className="text-2xl font-black text-slate-900">{fmt(totalEarned)}</p>
          <p className="text-[10px] text-slate-500">Total gagné</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm bg-emerald-50">
          <div className="flex items-center space-x-2 mb-2"><Wallet className="w-5 h-5 text-emerald-600" /></div>
          <p className="text-2xl font-black text-emerald-700">{fmt(balance)}</p>
          <p className="text-[10px] text-emerald-600 font-bold">Solde disponible</p>
        </div>
      </div>

      {/* Affiliate Link & Code */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-blue-600" /><span>Votre lien d'affiliation</span>
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 truncate">{affiliateLink}</div>
          <button onClick={copyLink} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm">
            <Copy className="w-4 h-4" /><span>Copier</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Code :</span>
            <span className="bg-purple-50 text-purple-700 font-mono font-bold text-sm px-3 py-1 rounded-lg border border-purple-200">{affiliateCode}</span>
          </div>
          <button onClick={copyCode} className="text-xs text-blue-600 hover:underline font-bold">Copier le code</button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
          <strong>Comment ça marche :</strong> Partagez votre lien → Votre filleul s'inscrit et souscrit à un plan payant → Vous recevez <strong>30%</strong> du montant dans votre compte affilié → Retirez sur Mobile Money.
        </div>
      </div>

      {/* Mobile Money Account */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-600" /><span>Compte Mobile Money (retrait)</span>
        </h3>
        <div className="flex items-center space-x-3">
          <input type="tel" value={momoNumber} onChange={e => { setMomoNumber(e.target.value); setMomoSaved(false); }}
            placeholder="+229 01 97 00 00 00"
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <button onClick={saveMomo}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 ${momoSaved ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
            {momoSaved ? <><CheckCircle2 className="w-4 h-4" /><span>Enregistré</span></> : <span>Enregistrer</span>}
          </button>
        </div>
        <p className="text-[10px] text-slate-400">Ce numéro sera utilisé pour recevoir vos retraits. MTN, Moov, Orange, Wave acceptés.</p>
      </div>

      {/* Withdraw */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <ArrowUpRight className="w-4 h-4 text-blue-600" /><span>Retrait</span>
          </h3>
          <button onClick={() => setShowWithdraw(!showWithdraw)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center space-x-1.5">
            <ArrowUpRight className="w-4 h-4" /><span>Demander un retrait</span>
          </button>
        </div>

        {showWithdraw && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 animate-fadeIn">
            <p className="text-xs text-blue-800">Solde disponible : <strong>{fmt(balance)}</strong></p>
            <div className="flex items-center space-x-3">
              <input type="number" value={withdrawAmount || ''} onChange={e => setWithdrawAmount(Number(e.target.value))}
                placeholder="Montant à retirer" className="flex-1 bg-white border border-blue-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleWithdraw} disabled={withdrawLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5">
                {withdrawLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowUpRight className="w-4 h-4" />}
                <span>{withdrawLoading ? 'Envoi...' : 'Retirer'}</span>
              </button>
            </div>
            {!momoSaved && <p className="text-[10px] text-rose-600 font-bold">⚠️ Enregistrez votre numéro Mobile Money ci-dessus d'abord.</p>}
            <p className="text-[10px] text-blue-600">Le retrait sera envoyé au : <strong>{momoNumber || '—'}</strong></p>
          </div>
        )}
      </div>

      {/* Referrals List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" /><span>Mes filleuls ({referrals.length})</span>
          </h3>
        </div>
        {referrals.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {referrals.map(r => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-900">{r.name}</p>
                  <p className="text-[10px] text-slate-400">{r.email} · {r.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600">+{fmt(r.earned)}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.status==='active'?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}`}>
                    {r.status==='active'?'Actif':'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Aucun filleul pour le moment. Partagez votre lien !</p>
          </div>
        )}
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" /><span>Historique des retraits</span>
          </h3>
        </div>
        {withdrawals.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {withdrawals.map(w => (
              <div key={w.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-900">{fmt(w.amount)}</p>
                  <p className="text-[10px] text-slate-400">{w.phone} · {w.date}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${w.status==='completed'?'bg-emerald-50 text-emerald-600':w.status==='pending'?'bg-amber-50 text-amber-600':'bg-rose-50 text-rose-600'}`}>
                  {w.status==='completed'?'✓ Envoyé':w.status==='pending'?'⏳ En cours':'✕ Échoué'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">Aucun retrait effectué</div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900">
        <p className="font-bold mb-1">📋 Conditions du programme</p>
        <ul className="space-y-0.5 text-[10px] text-purple-800 list-disc list-inside">
          <li>Commission de <strong>30%</strong> sur chaque abonnement payant (Starter, Business, Entreprise)</li>
          <li>La commission est créditée dès que le filleul paie son abonnement</li>
          <li>Retrait minimum : <strong>1 000 FCFA</strong></li>
          <li>Retrait instantané sur Mobile Money (MTN, Moov, Orange, Wave)</li>
          <li>Pas de limite de filleuls — gains illimités</li>
        </ul>
      </div>
    </div>
  );
};
