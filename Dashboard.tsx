import React from 'react';
import { 
  Sparkles, 
  Receipt,
  Bot,
  Palette,
  Printer,
  ChevronRight,
  ChevronLeft,
  FileText,
  FileCheck,
  Award,
  PenTool,
  CreditCard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from "./src/config/supabaseClient";

interface DashboardProps {
  onNavigateToTab: (tab: any, subTab?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ factures: 0, quittances: 0, cv: 0, signatures: 0, signaturesLimit: 0, subscription: 'Gratuit' });

  useEffect(() => {
    if (!user) return;
        const fetchStats = async () => {
      try {
        const { count: fCount } = await supabase.from('factures').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const { count: qCount } = await supabase.from('quittances').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const { count: cCount } = await supabase.from('cv').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const { count: sCount } = await supabase.from('signatures').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

        // Récupération de l'abonnement
        const { data: subData } = await supabase.from('user_subscriptions').select('plan_slug').eq('user_id', user.id).eq('status', 'active').maybeSingle();
        
        // Récupération de la limite (le quota)
        const { data: metricData } = await supabase.from('user_metrics').select('limit').eq('user_id', user.id).eq('metric', 'signatures').maybeSingle();

        setStats({
          factures: fCount || 0,
          quittances: qCount || 0,
          cv: cCount || 0,
          signatures: sCount || 0,
          signaturesLimit: metricData?.limit || 5, // 5 par défaut
          subscription: subData?.plan_slug || 'Gratuit'
        });
      } catch (error) {
        console.error("Erreur de chargement:", error);
      }
    };

    fetchStats();
  }, [user]);
  const quickNavCards = [
    { id:'inv', title:'Générer une Facture', desc:'Factures normalisées DGI & tickets thermiques', icon:Receipt, tab:'invoice-generator', bg:'from-blue-600 to-blue-700', badge:'Normalisé' },
    { id:'quit', title:'Créer une Quittance', desc:'Loyer, service, transport, éducation, santé', icon:Receipt, tab:'quittance-generator', bg:'from-teal-600 to-teal-700', badge:'Pro' },
    { id:'cv', title:'Générateur CV IA', desc:'CV professionnel avec 20 templates premium', icon:Receipt, tab:'cv-generator', bg:'from-indigo-600 to-purple-700', badge:'🤖 IA' },
    { id:'sign', title:'Signer un Document', desc:'Importez PDF/Image, ajoutez cachet et signature', icon:Receipt, tab:'document-signer', bg:'from-emerald-600 to-teal-700', badge:'PDF' },
    { id:'stamps', title:'Cachets & Signatures', desc:'Tampon, signature manuscrite, personnalisation', icon:Receipt, tab:'stamp-signature', bg:'from-rose-600 to-pink-700', badge:'🔧' },
    { id:'tpl', title:'50 Templates & Modèles', desc:'Personnaliser factures, quittances et CV', icon:Palette, tab:'customizer-templates', bg:'from-purple-600 to-pink-700', badge:'Design' },
    { id:'ai', title:'Assistant IA Adnana', desc:'Optimiser prix, prévoir ventes et stock', icon:Bot, tab:'ai-assistant', bg:'from-violet-600 to-indigo-700', badge:'IA Chat' },
    { id:'erp', title:'Gestion Commerciale', desc:'Produits, clients, stock, caisses, rapports', icon:Receipt, tab:'commercial-management', bg:'from-amber-600 to-orange-700', badge:'ERP' },
    { id:'projects', title:'Mes Projets', desc:'Retrouvez et restaurez vos réalisations', icon:Receipt, tab:'projects', bg:'from-cyan-600 to-blue-700', badge:'📁' },
    { id:'export', title:'Impression & Export', desc:'PDF, PNG, Excel, CSV, imprimante POS', icon:Printer, tab:'print-export', bg:'from-slate-700 to-slate-800', badge:'PDF' },
  ];

  return (
    <div className="p-3 sm:p-5 space-y-4 max-w-7xl mx-auto animate-fadeIn">
      {/* User Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-2"><FileText className="w-6 h-6" /></div>
          <span className="text-2xl font-black text-slate-900">{stats.factures}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Factures</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mb-2"><FileCheck className="w-6 h-6" /></div>
          <span className="text-2xl font-black text-slate-900">{stats.quittances}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Quittances</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600 mb-2"><Award className="w-6 h-6" /></div>
          <span className="text-2xl font-black text-slate-900">{stats.cv}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">CV Créés</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="bg-rose-100 p-3 rounded-full text-rose-600 mb-2"><PenTool className="w-6 h-6" /></div>
          <span className="text-2xl font-black text-slate-900">{stats.signatures}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Signatures</span>
        </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600 mb-2"><CreditCard className="w-6 h-6" /></div>
          <span className="text-lg font-black text-slate-900 capitalize">{stats.subscription}</span>
          <span className="text-[10px] font-bold text-amber-700 uppercase mt-1">Quota : {stats.signatures} / {stats.signaturesLimit}</span>
        </div>

      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-2xl border border-blue-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-xs uppercase tracking-widest font-extrabold text-blue-300">Tableau de Bord</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">Bienvenue, {user?.user_metadata.full_name || 'Utilisateur'}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Gérez vos factures, quittances et documents en toute sécurité.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigateToTab('invoice-generator')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 border border-blue-400/30 transform hover:scale-105"
            >
              <Receipt className="w-4 h-4" />
              <span>Facture Normalisée</span>
            </button>
            <button 
              onClick={() => onNavigateToTab('ai-assistant')}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold px-5 py-3 rounded-xl transition-all border border-slate-600 flex items-center space-x-2 backdrop-blur-sm transform hover:scale-105"
            >
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Interroger l'IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials Section (Mobile Optimized) */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-base sm:text-xl font-extrabold mb-4 sm:mb-6 flex items-center space-x-2 relative z-10">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          <span>Ce que disent nos utilisateurs</span>
        </h2>
        <TestimonialSlider />
      </div>

      {/* Navigation Rapide — grille de tuiles */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 px-1">Menu de Navigation Rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} onClick={() => onNavigateToTab(card.tab)}
                className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex items-start justify-between group hover:-translate-y-1">
                <div className="flex items-start space-x-4">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${card.bg} text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{card.title}</h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{card.badge}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[200px]">{card.desc}</p>
                  </div>
                </div>
                <div className="p-1 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors self-center">
                  <ChevronRight className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

const testimonials = [
  { name: "Amadou Diallo", role: "Commerçant, Dakar", text: "Factureset a simplifié ma comptabilité. Je gagne un temps précieux chaque jour.", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Fatou Ndiaye", role: "Gérante PME, Abidjan", text: "Les quittances sont parfaites et professionnelles. Mes clients sont impressionnés.", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Moussa Konaté", role: "Entrepreneur, Bamako", text: "L'IA m'aide à gérer mon stock sans erreur. Un outil indispensable.", avatar: "https://randomuser.me/api/portraits/men/11.jpg" },
  { name: "Aisha Bello", role: "Directrice, Lagos", text: "Interface très claire et professionnelle. Le support est réactif.", avatar: "https://randomuser.me/api/portraits/women/63.jpg" },
  { name: "Jean-Baptiste Kouassi", role: "Freelance, Abidjan", text: "Le générateur de CV m'a aidé à décrocher un contrat important.", avatar: "https://randomuser.me/api/portraits/men/53.jpg" },
  { name: "Mariam Sow", role: "Commerçante, Conakry", text: "Je peux enfin suivre mes dépenses et mes revenus facilement.", avatar: "https://randomuser.me/api/portraits/women/28.jpg" },
  { name: "Ousmane Traoré", role: "PDG, Ouagadougou", text: "Le meilleur outil de gestion pour les PME en Afrique de l'Ouest.", avatar: "https://randomuser.me/api/portraits/men/74.jpg" },
  { name: "Grace Adeyemi", role: "Comptable, Lagos", text: "La conformité fiscale est assurée. Je dors tranquille.", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Ibrahim Ba", role: "Importateur, Dakar", text: "Je recommande à 100%. La signature électronique est un plus énorme.", avatar: "https://randomuser.me/api/portraits/men/82.jpg" },
  { name: "Zainab Hassan", role: "Gérante, Kano", text: "Mes clients adorent recevoir des factures propres et rapides.", avatar: "https://randomuser.me/api/portraits/women/81.jpg" },
  { name: "Kwame Mensah", role: "Artisan, Accra", text: "Excellent rapport qualité/prix. Très facile à utiliser.", avatar: "https://randomuser.me/api/portraits/men/41.jpg" },
  { name: "Amina Yusuf", role: "Startup, Abuja", text: "L'automatisation des tâches répétitives a boosté ma productivité.", avatar: "https://randomuser.me/api/portraits/women/21.jpg" },
  { name: "Samuel Osei", role: "Vendeur, Accra", text: "Même sans être un expert en informatique, j'y arrive parfaitement.", avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
  { name: "Chidinma Okafor", role: "Boutique, Lagos", text: "Mes ventes ont augmenté grâce aux rapports détaillés de l'IA.", avatar: "https://randomuser.me/api/portraits/women/51.jpg" },
  { name: "Emmanuel Mensah", role: "Grossiste, Kumasi", text: "Indispensable pour mon business. Je ne peux plus m'en passer.", avatar: "https://randomuser.me/api/portraits/men/66.jpg" },
  { name: "Omar Sy", role: "Comptable, Dakar", text: "La conformité DGI de mes factures est parfaite. Plus de soucis avec le fisc grâce aux modèles normalisés.", avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
  { name: "Aminata Diop", role: "Étudiante, Dakar", text: "J'ai utilisé le générateur de CV avec l'IA Adnana. En 5 minutes, j'avais un CV pro qui a convaincu mon recruteur.", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
  { name: "Koffi Adjovi", role: "Notaire, Cotonou", text: "Pouvoir apposer mon cachet et ma signature directement sur les documents PDF me fait gagner un temps fou. C'est magique !", avatar: "https://randomuser.me/api/portraits/men/13.jpg" },
  { name: "Blessing Okoro", role: "Boutiquière, Lagos", text: "L'impression sur ticket thermique 58mm fonctionne à merveille. Mes clients repartent avec leur reçu immédiatement.", avatar: "https://randomuser.me/api/portraits/women/13.jpg" },
  { name: "Youssef El Amrani", role: "Gérant Supermarché, Casablanca", text: "L'alerte de stock de l'IA m'a sauvé la mise avant la rupture de stock de mes produits phares pendant les fêtes.", avatar: "https://randomuser.me/api/portraits/men/14.jpg" },
  { name: "Maman Diouf", role: "Propriétaire Immobilier, Dakar", text: "Gérer les quittances de loyer pour mes 20 appartements était un cauchemar. Maintenant, c'est fait en 2 clics.", avatar: "https://randomuser.me/api/portraits/men/15.jpg" },
  { name: "Chioma Nwosu", role: "Import/Export, Lagos", text: "Le wallet multidevise est génial pour mes fournisseurs internationaux. Je gère tout depuis une seule interface.", avatar: "https://randomuser.me/api/portraits/women/14.jpg" },
  { name: "Sekou Camara", role: "Graphiste, Conakry", text: "Les 50 templates de factures sont magnifiques. J'ai pu personnaliser mon logo pour refléter mon image de marque.", avatar: "https://randomuser.me/api/portraits/men/16.jpg" },
  { name: "Tunde Bakare", role: "Marketeur, Abuja", text: "Le programme d'affiliation à 30% est une vraie mine d'or. Je recommande FACTUREset et je gagne de l'argent passif.", avatar: "https://randomuser.me/api/portraits/men/17.jpg" },
  { name: "Nana Akua", role: "CEO, Accra", text: "C'est un vrai ERP complet. De la facture au rapport fiscal, tout y est pour piloter mon entreprise efficacement.", avatar: "https://randomuser.me/api/portraits/women/15.jpg" }
];

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev: number) => (prev + 1) % testimonials.length);
    }, 6000); // Auto-scroll every 6 seconds
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev: number) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev: number) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="relative z-10 max-w-3xl mx-auto">
      <div key={currentIndex} className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-white/20 min-h-[160px] sm:min-h-[200px] flex flex-col justify-center items-center text-center animate-fadeIn">
        <img 
          src={testimonials[currentIndex].avatar} 
          alt={testimonials[currentIndex].name} 
          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-4 border-white/30 mb-3 sm:mb-4 bg-white shadow-lg object-cover"
        />
        <p className="text-sm sm:text-lg font-medium italic mb-3 sm:mb-4 text-blue-100 leading-relaxed">"{testimonials[currentIndex].text}"</p>
        <div>
          <p className="font-bold text-white text-base sm:text-lg">{testimonials[currentIndex].name}</p>
          <p className="text-[10px] sm:text-xs text-blue-300 uppercase tracking-wider font-semibold">{testimonials[currentIndex].role}</p>
        </div>
      </div>
      
      {/* Manual Controls */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        <button onClick={prev} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex space-x-2 overflow-x-auto max-w-[200px] scrollbar-hide py-2">
          {testimonials.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
        <button onClick={next} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};
