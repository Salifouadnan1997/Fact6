import React, { useState, useEffect } from 'react';
import { 
  Receipt, Palette, Briefcase, FileSpreadsheet, 
  ShieldCheck, FileSignature, 
  ArrowRight, Sparkles, Menu, X, LogIn, UserPlus, ChevronLeft, ChevronRight
} from 'lucide-react';
import { LoginPage } from './LoginPage';

export const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState<'none' | 'login' | 'register'>('none');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    { id: 'invoice', title: 'Factures & Quittances', desc: 'Générez des factures normalisées DGI et quittances professionnelles en quelques clics.', icon: Receipt, color: 'from-blue-500 to-cyan-500', action: 'login' },
    { id: 'cv', title: 'Générateur de CV IA', desc: 'Créez des CV professionnels et modernes avec l\'intelligence artificielle Adnana.', icon: FileSpreadsheet, color: 'from-purple-500 to-indigo-500', action: 'login' },
    { id: 'sign', title: 'Signer des Documents', desc: 'Importez vos PDF, ajoutez cachets et signatures électroniques en toute sécurité.', icon: FileSignature, color: 'from-emerald-500 to-teal-500', action: 'login' },
    { id: 'erp', title: 'Gestion Commerciale', desc: 'Gérez vos stocks, clients, fournisseurs et caisses avec notre ERP intégré.', icon: Briefcase, color: 'from-amber-500 to-orange-500', action: 'login' },
    { id: 'stamp', title: 'Cachets & Tampons', desc: 'Créez et personnalisez vos cachets professionnels et signatures manuscrites.', icon: ShieldCheck, color: 'from-rose-500 to-pink-500', action: 'login' },
    { id: 'templates', title: '50+ Templates', desc: 'Personnalisez l\'apparence de vos documents avec nos modèles premium.', icon: Palette, color: 'from-violet-500 to-fuchsia-500', action: 'login' },
  ];

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

  if (showAuth !== 'none') {
    return <LoginPage onBack={() => setShowAuth('none')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">FACTURE<span className="text-blue-600">set</span></span>
              </div>
              
              {/* Login Button moved here (Between Logo and Menu/Links) */}
              <button 
                onClick={() => setShowAuth('login')} 
                className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-all border border-slate-200 text-sm"
              >
                <LogIn className="w-4 h-4 text-blue-600" /> 
                <span>Se connecter</span>
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Fonctionnalités</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Témoignages</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Tarifs</a>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <button 
                onClick={() => setShowAuth('register')} 
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                <UserPlus className="w-5 h-5" /> 
                <span>Inscription</span>
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-3">
              <button onClick={() => setShowAuth('login')} className="text-blue-600 font-bold text-xs flex items-center space-x-1 border border-blue-200 px-2 py-1.5 rounded-lg bg-blue-50">
                <LogIn className="w-4 h-4" /> <span>Connexion</span>
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3 animate-fadeIn">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Fonctionnalités</a>
            <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Témoignages</a>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button onClick={() => { setShowAuth('login'); setIsMenuOpen(false); }} className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors">
                <LogIn className="w-5 h-5 text-blue-600" /> <span>Se connecter</span>
              </button>
              <button onClick={() => { setShowAuth('register'); setIsMenuOpen(false); }} className="flex items-center space-x-3 w-full p-3 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors">
                <UserPlus className="w-5 h-5" /> <span>Créer un compte</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100/30 rounded-bl-[100px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-blue-200">
            <Sparkles className="w-3 h-3" /> <span>Nouveau : Générateur de CV IA disponible</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            La plateforme tout-en-un pour <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">votre gestion commerciale</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Factures normalisées, quittances, CV professionnels, signature électronique et gestion de stock. Tout ce dont vous avez besoin, au même endroit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button onClick={() => setShowAuth('register')} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-8 py-3 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-1">
              <span>Commencer gratuitement</span> <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Tout ce dont vous avez besoin</h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">Des outils puissants et intuitifs pour développer votre activité.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.id} className="group bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed text-sm">{feature.desc}</p>
                  <button onClick={() => setShowAuth('login')} className="text-blue-600 font-bold text-sm flex items-center space-x-1 group-hover:space-x-2 transition-all">
                    <span>Accéder au module</span> <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-2">Ils nous font confiance</h2>
            <p className="text-slate-400 text-sm sm:text-base">Rejoignez des milliers d'entrepreneurs satisfaits.</p>
          </div>
          <TestimonialSlider testimonials={testimonials} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Prêt à transformer votre gestion ?</h2>
          <p className="text-blue-100 text-base mb-6 max-w-2xl mx-auto">Créez votre compte gratuitement et accédez à tous nos outils professionnels dès maintenant.</p>
          <button onClick={() => setShowAuth('register')} className="bg-white text-blue-600 hover:bg-blue-50 text-base font-bold px-10 py-4 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1">
            Créer mon compte gratuit
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-white">FACTURE<span className="text-blue-600">set</span></span>
          </div>
          <div className="text-sm">© 2026 FACTUREset. Tous droits réservés.</div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const TestimonialSlider = ({ testimonials }: { testimonials: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev: number) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const next = () => setCurrentIndex((prev: number) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev: number) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="relative z-10 w-full">
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
