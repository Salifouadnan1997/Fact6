import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { AIChatMessage, Product, AIAnalytics } from './types';

interface AIAssistantProps {
  products: Product[];
  analytics: AIAnalytics;
  onNavigateToTab: (tab: any, subTab?: string) => void;
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  analytics,
  onNavigateToTab,
  onTriggerToast
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: "Bonjour ! Je suis Adnana, votre Assistante Commerciale Intelligente. Je surveille en permanence votre chiffre d'affaires, vos stocks et vos factures normalisées. Que souhaitez-vous analyser ou optimiser aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
  };

  const addAIMessage = (text: string, actionType?: any, actionData?: any) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType,
          actionData
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: AIChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Simulated NLP matching
    const lower = inputVal.toLowerCase();
    if (lower.includes('vente') || lower.includes('chiffre') || lower.includes('ca')) {
      addAIMessage(
        `Votre chiffre d'affaires actuel s'élève à ${formatFCFA(analytics.totalRevenue)} (+${analytics.revenueGrowth}% ce mois-ci). La croissance est propulsée par la catégorie 'Supermarché & Alimentaire'.`,
        'report',
        { revenue: analytics.totalRevenue, profit: analytics.totalProfit }
      );
    } else if (lower.includes('rupture') || lower.includes('stock')) {
      addAIMessage(
        "Alerte de Stock : L'Imprimante Thermique POS 80mm est en seuil critique (4 unités restantes). Je vous recommande d'anticiper la commande auprès de Global Tech Import.",
        'restock',
        { productId: 'prod-9', name: 'Imprimante Thermique POS 80mm', stock: 4 }
      );
    } else if (lower.includes('prix') || lower.includes('marge')) {
      addAIMessage(
        "Analyse de Prix : Le Mérou Frais Nettoyé se vend très bien à 8,500 FCFA. Nos algorithmes suggèrent un prix de 9,000 FCFA pour augmenter la marge globale de +6% sans impacter la demande.",
        'repricing',
        { productId: 'prod-11', name: 'Mérou Frais Nettoyé (kg)', oldPrice: 8500, newPrice: 9000 }
      );
    } else if (lower.includes('promo') || lower.includes('promotion')) {
      addAIMessage(
        "Proposition de Promotion : Créez un 'Pack Été' combinant Riz Parfumé 25kg + Huile Végétale 5L avec -5% de remise pour liquider le surplus de stock d'huile avant fin juin.",
        'promotion',
        { bundle: 'Riz 25kg + Huile 5L', discount: '5%' }
      );
    } else if (lower.includes('anomalie') || lower.includes('erreur') || lower.includes('doublon')) {
      addAIMessage(
        "Audit DGI & Comptabilité : J'ai détecté 3 anomalies mineures. Un écart de marge sur le Thermomètre Infrarouge et un pic inexpliqué dimanche soir. Les factures normalisées sont conformes à 100%.",
        'report',
        { anomaliesCount: 3 }
      );
    } else {
      addAIMessage(
        "J'ai bien pris en compte votre demande. Je lance une simulation prédictive sur l'historique de vos caisses pour extraire les recommandations appropriées. Vous pouvez aussi utiliser les boutons d'actions rapides ci-dessous."
      );
    }
  };

  // Quick Action Triggers
  const handleQuickAction = (type: string) => {
    let promptText = '';
    if (type === 'sales') promptText = 'Analyser les ventes récentes et le chiffre d\'affaires';
    if (type === 'stock') promptText = 'Prévoir les ruptures de stock imminentes';
    if (type === 'price') promptText = 'Recommander des prix de vente pour maximiser les bénéfices';
    if (type === 'promo') promptText = 'Proposer des promotions sur les produits à rotation lente';
    if (type === 'anomalies') promptText = 'Détecter des anomalies comptables ou doublons de facturation';
    if (type === 'stats') promptText = 'Générer des statistiques de prévision mensuelle';

    setMessages(prev => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        text: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    if (type === 'sales') {
      addAIMessage(
        `Synthèse des Ventes : Chiffre d'affaires de ${formatFCFA(analytics.totalRevenue)} avec des bénéfices nets de ${formatFCFA(analytics.totalProfit)}. Le panier moyen est en hausse de +8.4%.`,
        'report',
        { revenue: analytics.totalRevenue, profit: analytics.totalProfit }
      );
    } else if (type === 'stock') {
      addAIMessage(
        "Prévision Ruptures : 1 produit critique identifié (Imprimante Thermique POS 80mm - 4 restants). 2 autres produits approchent du stock d'alerte. Voulez-vous générer un bon de commande fournisseur ?",
        'restock',
        { productId: 'prod-9', name: 'Imprimante Thermique POS 80mm', stock: 4 }
      );
    } else if (type === 'price') {
      addAIMessage(
        "Recommandation Tarifaire : Ajustement conseillé sur 'Mérou Frais Nettoyé' (passer de 8,500 à 9,000 FCFA) et sur 'Smartphone Pro 128GB' (passer de 185,000 à 189,000 FCFA). Gain estimé : +420,000 FCFA/mois.",
        'repricing',
        { items: ['Mérou Frais (+500 FCFA)', 'Smartphone Pro (+4,000 FCFA)'] }
      );
    } else if (type === 'promo') {
      addAIMessage(
        "Stratégie Promotionnelle : Mettez en place une offre combinée 'Menu Poulet Braisé + Jus de Bissap 1L' à 7,000 FCFA au lieu de 7,500 FCFA le week-end pour doper les ventes en restauration de +25%.",
        'promotion',
        { title: 'Menu Braisé + Bissap', discount: '500 FCFA' }
      );
    } else if (type === 'anomalies') {
      addAIMessage(
        "Détection d'Anomalies : 0 doublon de facture détecté. Conformité RCCM & IFU vérifiée par intelligence artificielle. 1 alerte logistique sur la Caisse 2 (écart de clôture de 1,500 FCFA résolu).",
        'report',
        { status: 'Conforme DGI' }
      );
    } else if (type === 'stats') {
      addAIMessage(
        `Prévisions Mensuelles IA : Juin 2026 attendu à ${formatFCFA(16800000)} (Confiance: 94%). Juillet attendu à ${formatFCFA(18200000)}. L'afflux de touristes stimulera le secteur hôtelier.`,
        'report',
        { forecastJune: 16800000, forecastJuly: 18200000 }
      );
    }
  };

  const handleExecuteAIAction = (actionType: string, data: any) => {
    if (actionType === 'restock') {
      onTriggerToast(`Bon de commande automatique créé pour : ${data.name}`, 'success');
      onNavigateToTab('commercial-management', 'stock');
    } else if (actionType === 'repricing') {
      onTriggerToast('Nouveaux tarifs appliqués au catalogue avec succès !', 'success');
      onNavigateToTab('commercial-management', 'products');
    } else if (actionType === 'promotion') {
      onTriggerToast('Campagne promotionnelle configurée dans le système POS.', 'success');
      onNavigateToTab('commercial-management', 'products');
    } else {
      onTriggerToast('Rapport comptable exporté vers le module de Gestion Commerciale.', 'success');
      onNavigateToTab('commercial-management', 'reports');
    }
  };

  const quickActions = [
    { id: 'sales', label: '📊 Analyser les Ventes', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { id: 'stock', label: '📦 Prévoir Ruptures de Stock', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
    { id: 'price', label: '💰 Recommander des Prix', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { id: 'promo', label: '🏷️ Proposer des Promotions', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
    { id: 'anomalies', label: '⚠️ Détecter les Anomalies', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
    { id: 'stats', label: '📈 Statistiques & Prévisions', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Chat Window – Full height */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Chat Header */}
        <div className="bg-slate-900 px-5 py-3 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold block">Adnana</span>
              <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                <span>Assistante IA Commerciale — En ligne</span>
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              setMessages([messages[0]]);
              onTriggerToast('Conversation réinitialisée', 'info');
            }} 
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Effacer</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m) => {
            const isAI = m.sender === 'ai';
            return (
              <div key={m.id} className={`flex items-start space-x-3 ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isAI ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white' : 'bg-slate-800 text-blue-400'
                }`}>
                  {isAI ? <Bot className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>

                <div className={`max-w-xl rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                  isAI ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none font-medium'
                }`}>
                  <div className="flex items-center justify-between mb-1 text-[10px] opacity-70">
                    <span className="font-bold">{isAI ? 'Adnana' : 'Vous'}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-line">{m.text}</p>

                  {isAI && m.actionType && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleExecuteAIAction(m.actionType!, m.actionData)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all flex items-center space-x-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {m.actionType === 'restock' ? 'Commande Fournisseur' :
                           m.actionType === 'repricing' ? 'Appliquer Nouveaux Prix' :
                           m.actionType === 'promotion' ? 'Activer la Promotion' : 'Ouvrir le Rapport'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs italic p-2">
              <Bot className="w-4 h-4 animate-bounce text-blue-600" />
              <span>Adnana analyse les données commerciales...</span>
            </div>
          )}
        </div>

        {/* Quick Actions Ticker – auto-scrolling horizontal strip */}
        <div className="border-t border-slate-200 bg-white shrink-0 overflow-hidden relative">
          <div className="flex items-center px-3 py-2 overflow-x-auto space-x-2 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Actions :</span>
            {/* Duplicate items for seamless scrolling feel */}
            {[...quickActions, ...quickActions].map((qa, idx) => (
              <button
                key={`${qa.id}-${idx}`}
                onClick={() => handleQuickAction(qa.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${qa.color}`}
              >
                {qa.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendCustom} className="px-4 py-3 bg-white border-t border-slate-200 flex space-x-2 shrink-0">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Demandez à Adnana d'analyser vos ventes, prix, stocks..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
};
