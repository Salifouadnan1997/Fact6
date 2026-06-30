import { supabase } from './src/config/supabaseClient';
import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, RefreshCw, History, Globe, Search, Send, Loader2, AlertCircle } from 'lucide-react';

const API_BASE = 'https://ivnvckgzkxxhowusxczt.supabase.co/functions/v1';

export const API_KEY = import.meta.env.VITE_STRIPE_KEY;

  // ── Backup Functions ──

interface WalletData {
  currency: string; country_code: string; country_name: string;
  balance: number; pending_balance: number; available_balance: number; updated_at: string;
}
interface TxData {
  id: string; type: string; amount: number; direction: string; currency: string;
  description: string; reference_type: string; balance_before: number; balance_after: number; created_at: string;
}

const FLAGS: Record<string, string> = {
  CI:'🇨🇮',SN:'🇸🇳',BJ:'🇧🇯',TG:'🇹🇬',ML:'🇲🇱',BF:'🇧🇫',GW:'🇬🇼',NE:'🇳🇪',GN:'🇬🇳',
  CM:'🇨🇲',GA:'🇬🇦',CG:'🇨🇬',CD:'🇨🇩',NG:'🇳🇬',GH:'🇬🇭',KE:'🇰🇪',TZ:'🇹🇿',UG:'🇺🇬',RW:'🇷🇼',ZA:'🇿🇦',ZM:'🇿🇲',EG:'🇪🇬',
};

interface WalletProps {
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const Wallet: React.FC<WalletProps> = ({ onTriggerToast }) => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<TxData[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [txCurrency, setTxCurrency] = useState('');

  // Transfer state
  const [showTransfer, setShowTransfer] = useState(false);
  const [trRecipient, setTrRecipient] = useState('');
  const [trAmount, setTrAmount] = useState(0);
  const [trCurrency, setTrCurrency] = useState('XOF');
  const [trDesc, setTrDesc] = useState('');
  const [trLoading, setTrLoading] = useState(false);

  const fmt = (n: number, cur: string) => `${new Intl.NumberFormat('fr-FR').format(n)} ${cur}`;

  // Fetch balances
  const fetchBalances = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api-wallet-balance`, { headers: { 'X-API-Key': API_KEY } });
      const json = await res.json();
      if (json.success && json.data?.wallets) {
        setWallets(json.data.wallets);
      } else {
        setError('Impossible de charger les soldes');
      }
    } catch (e) {
      setError('Erreur réseau: ' + (e as Error).message);
    }
    setLoading(false);
  };

  // Fetch transactions
  const fetchTransactions = async (currency?: string, type?: string) => {
    setTxLoading(true);
    try {
      let url = `${API_BASE}/api-wallet-transactions?limit=50`;
      if (currency) url += `&currency=${currency}`;
      if (type && type !== 'all') url += `&type=${type}`;
      const res = await fetch(url, { headers: { 'X-API-Key': API_KEY } });
      const json = await res.json();
      if (json.success && json.data?.transactions) {
        setTransactions(json.data.transactions);
      }
    } catch {}
    setTxLoading(false);
  };

  useEffect(() => { fetchBalances(); fetchTransactions(); }, []);

  const handleRefresh = () => { fetchBalances(); fetchTransactions(txCurrency || undefined, txFilter !== 'all' ? txFilter : undefined); onTriggerToast('Données actualisées', 'success'); };

  const handleFilterTx = (cur: string, type: string) => {
    setTxCurrency(cur); setTxFilter(type as any);
    fetchTransactions(cur || undefined, type !== 'all' ? type : undefined);
  };

  // Transfer
  const handleTransfer = async () => {
    if (!trRecipient.trim()) { onTriggerToast('Entrez un email ou téléphone', 'warning'); return; }
    if (trAmount <= 0) { onTriggerToast('Montant invalide', 'warning'); return; }
    setTrLoading(true);
    try {
      const isEmail = trRecipient.includes('@');
      const body: any = { amount: trAmount, currency: trCurrency, description: trDesc || 'Transfert FACTUREset' };
      if (isEmail) body.recipient_email = trRecipient; else body.recipient_phone = trRecipient;

      const res = await fetch(`${API_BASE}/api-wallet-transfer`, {
        method: 'POST',
        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        onTriggerToast(`Transfert de ${fmt(trAmount, trCurrency)} envoyé à ${json.data?.recipient?.name || trRecipient} !`, 'success');
        setShowTransfer(false); setTrRecipient(''); setTrAmount(0); setTrDesc('');
        fetchBalances(); fetchTransactions();
      } else {
        onTriggerToast(json.message || 'Échec du transfert', 'warning');
      }
    } catch (e) {
      onTriggerToast('Erreur: ' + (e as Error).message, 'warning');
    }
    setTrLoading(false);
  };

  const filteredWallets = search ? wallets.filter(w => w.currency.toLowerCase().includes(search.toLowerCase()) || w.country_name.toLowerCase().includes(search.toLowerCase())) : wallets;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <WalletIcon className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-extrabold tracking-tight">Wallet PayLiv</h1>
              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/30">Multidevise</span>
            </div>
            <p className="text-xs text-slate-400">Soldes en temps réel, historique et transferts wallet-to-wallet via l'API PayLiv.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Wallets actifs</p>
            <p className="text-2xl font-black">{wallets.length} <span className="text-sm text-blue-400">devises</span></p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs text-rose-800 font-medium">{error}</p>
        </div>
      )}

      {/* Balance Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12 space-x-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-xs font-bold">Chargement des soldes PayLiv...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {wallets.map(w => (
            <div key={w.currency + w.country_code} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{FLAGS[w.country_code] || '🌍'}</span>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{w.currency}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1 truncate">{w.country_name}</p>
              <p className="text-base font-black text-slate-900">{new Intl.NumberFormat('fr-FR').format(w.available_balance)}</p>
              <p className="text-[10px] text-slate-400">{w.currency} disponible</p>
              {w.pending_balance > 0 && (
                <p className="text-[9px] text-amber-600 font-bold mt-1">⏳ {new Intl.NumberFormat('fr-FR').format(w.pending_balance)} en attente</p>
              )}
            </div>
          ))}
          {wallets.length === 0 && !error && (
            <div className="col-span-full text-center py-8">
              <WalletIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Aucun wallet trouvé</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowTransfer(!showTransfer)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5">
          <Send className="w-4 h-4" /><span>Transfert wallet-to-wallet</span>
        </button>
        <button onClick={handleRefresh}
          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5">
          <RefreshCw className="w-4 h-4" /><span>Actualiser</span>
        </button>
      </div>

      {/* Transfer Panel */}
      {showTransfer && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-md space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Send className="w-4 h-4 text-blue-600" /><span>Transfert vers un autre utilisateur PayLiv</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Destinataire (email ou tél)</label>
              <input type="text" value={trRecipient} onChange={e => setTrRecipient(e.target.value)}
                placeholder="email@ex.com ou +229..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Montant</label>
              <input type="number" value={trAmount || ''} onChange={e => setTrAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Devise</label>
              <select value={trCurrency} onChange={e => setTrCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {(wallets.length > 0 ? wallets : [{currency:'XOF'},{currency:'XAF'},{currency:'NGN'},{currency:'GHS'},{currency:'KES'},{currency:'CDF'}]).map(w => (
                  <option key={w.currency} value={w.currency}>{w.currency}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
              <input type="text" value={trDesc} onChange={e => setTrDesc(e.target.value)}
                placeholder="Motif du transfert"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button onClick={handleTransfer} disabled={trLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5">
            {trLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{trLoading ? 'Envoi en cours...' : 'Envoyer le transfert'}</span>
          </button>
        </div>
      )}

      {/* All Wallets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-blue-600" /><span>Détail des wallets</span>
          </h3>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="bg-transparent text-xs text-slate-800 focus:outline-none w-32" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-4 text-left">Pays / Devise</th>
                <th className="py-2.5 px-4 text-right">Solde total</th>
                <th className="py-2.5 px-4 text-right">En attente</th>
                <th className="py-2.5 px-4 text-right">Disponible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWallets.map(w => (
                <tr key={w.currency + w.country_code} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base">{FLAGS[w.country_code] || '🌍'}</span>
                      <div>
                        <span className="font-bold text-slate-900">{w.currency}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">{w.country_name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">{new Intl.NumberFormat('fr-FR').format(w.balance)}</td>
                  <td className="py-3 px-4 text-right">{w.pending_balance > 0 ? <span className="text-amber-600 font-bold">{new Intl.NumberFormat('fr-FR').format(w.pending_balance)}</span> : <span className="text-slate-300">0</span>}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">{new Intl.NumberFormat('fr-FR').format(w.available_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-600" /><span>Historique des transactions</span>
          </h3>
          <div className="flex items-center space-x-2">
            <select value={txCurrency} onChange={e => handleFilterTx(e.target.value, txFilter)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700">
              <option value="">Toutes devises</option>
              {wallets.map(w => <option key={w.currency} value={w.currency}>{FLAGS[w.country_code]} {w.currency}</option>)}
            </select>
            <select value={txFilter} onChange={e => handleFilterTx(txCurrency, e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700">
              <option value="all">Tout</option>
              <option value="credit">Crédits</option>
              <option value="debit">Débits</option>
            </select>
          </div>
        </div>

        {txLoading ? (
          <div className="flex items-center justify-center py-8 space-x-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Chargement...</span>
          </div>
        ) : transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {transactions.map(tx => (
              <div key={tx.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.direction === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {tx.direction === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{tx.description}</p>
                    <p className="text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleString('fr-FR')} · {tx.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${tx.direction === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.direction === 'credit' ? '+' : '-'}{new Intl.NumberFormat('fr-FR').format(tx.amount)} {tx.currency}
                  </p>
                  <p className="text-[9px] text-slate-400">Solde: {new Intl.NumberFormat('fr-FR').format(tx.balance_after)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Aucune transaction trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};
