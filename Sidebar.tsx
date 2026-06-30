import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Palette, 
  Bot, 
  Briefcase, 
  Printer, 
  FileSpreadsheet,
  X,
  ShieldCheck,
  FileSignature,
  CreditCard,
  Wallet,
  Gift,
  FolderOpen,
  Settings,
  UserCog
} from 'lucide-react';
import { t, getLang, setLang } from './src/config/i18n';
import { Globe } from 'lucide-react';

export type TabType = 
  | 'dashboard'
  | 'projects'
  | 'invoice-generator'
  | 'quittance-generator'
  | 'customizer-templates'
  | 'stamp-signature'
  | 'document-signer'
  | 'ai-assistant'
  | 'commercial-management'
  | 'print-export'
  | 'wallet'
  | 'subscription'
  | 'affiliation'
  | 'cv-generator'
  | 'company-settings'
  | 'supplier-management'
  | 'admin-panel'
  | 'about'
  | 'privacy'
  | 'terms';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  commercialSubTab: string;
  onSelectCommercialSubTab: (subTab: string) => void;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  commercialSubTab, 
  onSelectCommercialSubTab,
  isMobileMenuOpen,
  onCloseMobileMenu,
  isAdmin = false
}) => {
  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, badge: 'IA Pro' },
    { id: 'projects', label: t('nav.projects'), icon: FolderOpen, badge: 'Dossier' },
    { id: 'invoice-generator', label: t('nav.invoices'), icon: Receipt, badge: 'Normalisé' },
    { id: 'quittance-generator', label: t('nav.quittances'), icon: FileSpreadsheet, badge: 'Quittance' },
    { id: 'customizer-templates', label: t('nav.templates'), icon: Palette, badge: '50' },
    { id: 'stamp-signature', label: t('nav.stamps'), icon: ShieldCheck, badge: 'Tampon' },
    { id: 'document-signer', label: t('nav.docsign'), icon: FileSignature, badge: 'New' },
    { id: 'ai-assistant', label: t('nav.ai'), icon: Bot, badge: 'Adnana' },
    { id: 'commercial-management', label: t('nav.commercial'), icon: Briefcase, badge: 'ERP' },
    { id: 'print-export', label: t('nav.export'), icon: Printer, badge: 'PDF' },
    { id: 'wallet', label: t('nav.wallet'), icon: Wallet, badge: '15' },
    { id: 'subscription', label: t('nav.subscription'), icon: CreditCard, badge: 'Pro' },
    { id: 'affiliation', label: t('nav.affiliation'), icon: Gift, badge: '💰' },
    { id: 'cv-generator', label: t('nav.cv'), icon: FileSpreadsheet, badge: '☁️ Pro' },
    { id: 'company-settings', label: 'Paramètres Entreprise', icon: Settings, badge: 'Info' },
    ...(isAdmin ? [
      { id: 'supplier-management', label: 'Gestion Fournisseurs', icon: UserCog, badge: 'Admin' },
      { id: 'admin-panel', label: 'Administration', icon: ShieldCheck, badge: 'Admin' }
    ] : []),
  ];

  const commercialSubTabs = [
    { id: 'products', label: 'Produits & Prix' },
    { id: 'categories', label: 'Catégories' },
    { id: 'stock', label: 'Stock & Alertes IA' },
    { id: 'suppliers', label: 'Fournisseurs' },
    { id: 'clients', label: 'Clients & Fidélité' },
    { id: 'expenses', label: 'Dépenses & Charges' },
    { id: 'caisses', label: 'Caisses & Sessions' },
    { id: 'users', label: 'Utilisateurs & Droits' },
    { id: 'reports', label: 'Rapports Fiscaux' },
  ];

  const handleTabClick = (tabId: TabType) => {
    onSelectTab(tabId);
    onCloseMobileMenu();
  };

  const handleSubTabClick = (subId: string) => {
    onSelectCommercialSubTab(subId);
    onCloseMobileMenu();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Mobile Drawer Header */}
      <div className="flex lg:hidden items-center justify-between p-4 border-b border-slate-800">
        <span className="font-extrabold text-base bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
          Menu de Navigation
        </span>
        <button 
          onClick={onCloseMobileMenu}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Language Switcher — TOP of sidebar */}
      <div className="p-3 border-b border-slate-800/60">
        <button
          onClick={() => { setLang(getLang() === 'fr' ? 'en' : 'fr'); window.location.reload(); }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
        >
          <div className="flex items-center space-x-2.5">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200">{getLang() === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}</span>
          </div>
          <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {getLang() === 'fr' ? 'EN' : 'FR'}
          </span>
        </button>
      </div>

      <div className="p-4 border-b border-slate-800/60">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">{getLang() === 'fr' ? 'Navigation Principale' : 'Main Navigation'}</p>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold translate-x-1' 
                    : 'hover:bg-slate-800 hover:text-slate-100 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                  isActive ? 'bg-blue-500 text-white border border-blue-400/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conditional Sub-navigation for Gestion Commerciale */}
      {activeTab === 'commercial-management' && (
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/60 flex-1">
          <div className="flex items-center space-x-2 mb-3 text-slate-400 px-1">
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Modules ERP</span>
          </div>
          <nav className="space-y-1">
            {commercialSubTabs.map((sub) => {
              const isSubActive = commercialSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubTabClick(sub.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    isSubActive
                      ? 'bg-slate-800 text-blue-400 font-bold border-l-4 border-blue-500 pl-4 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span>{sub.label}</span>
                  {sub.id === 'stock' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Quick AI Tip Widget at Bottom */}
      <div className="p-4 mt-auto border-t border-slate-800/60 bg-gradient-to-b from-transparent to-slate-950">
        <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl relative overflow-hidden shadow-inner">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="w-4 h-4 text-blue-400 animate-bounce" />
            <span className="text-xs font-bold text-slate-200">Conseil Adnana du jour</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "Le Mérou Frais est en forte rotation. Augmentez le prix unitaire de +5% pour maximiser votre marge brute ce weekend."
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={onCloseMobileMenu}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden animate-fadeIn" 
          aria-hidden="true"
        />
      )}

      {/* Mobile Fixed Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 shadow-2xl transition-transform duration-300 ease-in-out transform lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col border-r border-slate-800 shrink-0 min-h-[calc(100vh-65px)]">
        {sidebarContent}
      </aside>
    </>
  );
};
