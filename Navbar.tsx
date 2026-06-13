import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bell, 
  ShieldCheck, 
  Menu, 
  X, 
  LayoutDashboard, 
  Receipt, 

  Bot, 
  Briefcase, 
  Printer,
  ChevronDown,
  LogOut,
  Settings,
  Wifi,
  Camera
} from 'lucide-react';
import { Caisse, User } from '../types';
import { TabType } from './Sidebar';
import { supabase } from '../config/supabaseClient';
import { t } from '../config/i18n';

// Rotating title component — fades between FACTUREset and feature names
const getHeaderTexts = () => ['FACTUREset', t('header.invoice'), t('header.cv'), t('header.quittance'), t('header.sign'), t('header.stamps'), t('header.erp')];

const HeaderRotatingTitle = ({ onNavigate }: { onNavigate: () => void }) => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const texts = getHeaderTexts();

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % texts.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const text = texts[idx];
  const isBrand = idx === 0;

  return (
    <div className="flex-1 flex justify-center cursor-pointer" onClick={onNavigate}>
      <span className={`font-black text-base sm:text-lg tracking-[0.12em] select-none transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${isBrand ? 'bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent' : 'text-blue-400'}`}>
        {text}
      </span>
    </div>
  );
};

interface NavbarProps {
  activeCaisse: Caisse;
  onSelectCaisse: (caisseId: string) => void;
  caisses: Caisse[];
  currentUser: User;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeCaisse, 
  onSelectCaisse, 
  caisses, 
  currentUser,
  activeTab,
  onSelectTab,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onLogout
}) => {
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showConnPanel, setShowConnPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsName, setSettingsName] = useState(currentUser.name);
  const [settingsEmail, setSettingsEmail] = useState(currentUser.email);
  const [settingsOldPwd, setSettingsOldPwd] = useState('');
  const [settingsNewPwd, setSettingsNewPwd] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch avatar on mount
  useEffect(() => {
    const fetchAvatar = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.user_metadata?.avatar_url) {
        setAvatarUrl(data.user.user_metadata.avatar_url);
      }
    };
    fetchAvatar();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUser.id || 'user'}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Erreur lors de l\'upload: ' + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });
    
    setAvatarUrl(publicUrl);
    alert('Photo de profil mise à jour !');
  };

  const topNavItems = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'invoice-generator', label: 'Factures', icon: Receipt },
    { id: 'quittance-generator', label: 'Quittances', icon: Receipt },
    { id: 'stamp-signature', label: 'Cachets', icon: Sparkles },
    { id: 'ai-assistant', label: 'Adnana', icon: Bot },
    { id: 'commercial-management', label: 'Gestion', icon: Briefcase },
    { id: 'print-export', label: 'Export', icon: Printer },
  ];

  const notifications = [
    { id: 1, text: 'Imprimante Thermique POS 80mm en rupture imminente', type: 'warning' as const, time: 'il y a 12 min' },
    { id: 2, text: 'Facture FA-2026-0589 imprimée avec succès', type: 'success' as const, time: 'il y a 34 min' },
    { id: 3, text: 'Nouveau client VIP ajouté : Hôtel Ivoire & Suite', type: 'info' as const, time: 'il y a 1h' },
  ];

  const handleBellClick = () => {
    setBellAnimating(true);
    setShowNotifPanel(!showNotifPanel);
    setShowUserMenu(false);
    setShowConnPanel(false);
    setTimeout(() => setBellAnimating(false), 1500);
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifPanel(false);
    setShowConnPanel(false);
  };

  const handleConnClick = () => {
    setShowConnPanel(!showConnPanel);
    setShowNotifPanel(false);
    setShowUserMenu(false);
  };

  const handleNavClick = (tab: TabType) => {
    onSelectTab(tab);
    setShowNotifPanel(false);
    setShowUserMenu(false);
    setShowConnPanel(false);
  };

  const closeAll = () => { setShowNotifPanel(false); setShowUserMenu(false); setShowConnPanel(false); };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-xl border-b border-slate-800/80 relative">
      <div className="flex items-center justify-between px-4 sm:px-5 h-[56px]">

        {/* ═══ LEFT: Hamburger + Logo Icon ═══ */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-blue-400" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2.5 cursor-pointer select-none" onClick={() => handleNavClick('dashboard')}>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-lg shadow-blue-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* ═══ CENTER: Rotating title ═══ */}
        <HeaderRotatingTitle onNavigate={() => handleNavClick('dashboard')} />

        {/* ═══ RIGHT: Connection + Notifications + User ═══ */}
        <div className="flex items-center space-x-2">

          {/* Connection Status */}
          <button
            onClick={handleConnClick}
            className="hidden sm:flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700/80 transition-all"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-bold hidden lg:inline">Connecté</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={handleBellClick}
            className="relative p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/80 transition-all"
          >
            <Bell className={`w-5 h-5 text-slate-300 hover:text-white ${bellAnimating ? 'animate-bellRing' : ''}`} />
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[9px] font-extrabold rounded-full ring-2 ring-slate-900 shadow-lg">
              3
            </span>
          </button>

          {/* User Avatar */}
          <button 
            onClick={handleUserClick}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-700/80 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-white block truncate max-w-[90px] leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-blue-400 font-semibold leading-tight">{currentUser.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>
        </div>
      </div>

      {/* ── Row 2: Nav tabs + Caisse Active ── */}
      <div className="hidden xl:flex items-center justify-between px-5 pb-2 pt-0.5">
        <nav className="flex items-center space-x-1">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as TabType)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Caisse Active – in the nav row */}
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-2 py-1.5">
          <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mr-2">Caisse:</span>
          <select 
            value={activeCaisse.id}
            onChange={(e) => onSelectCaisse(e.target.value)}
            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
          >
            {caisses.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-800 text-white text-xs">
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Dropdown Panels (absolute positioned) ── */}
      
      {/* Connection Panel */}
      {showConnPanel && (
        <div className="absolute right-32 top-[56px] w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 animate-fadeIn z-[60]">
          <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-slate-800">
            <Wifi className="w-5 h-5 text-emerald-500" />
            <h4 className="text-sm font-bold text-white">État de la Connexion</h4>
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Serveur FACTUREset Cloud', ok: true },
              { label: 'Moteur Adnana IA', ok: true },
              { label: 'Conformité DGI / IFU', ok: true },
              { label: 'Imprimante POS', ok: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl">
                <span className="text-slate-300">{s.label}</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{s.ok ? 'OK' : 'Hors ligne'}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotifPanel && (
        <div className="absolute right-16 top-[56px] w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn z-[60]">
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <span>Notifications</span>
            </h4>
            <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">3</span>
          </div>
          <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start space-x-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                  n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{n.text}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Menu */}
      {showUserMenu && (
        <div className="absolute right-4 top-[56px] w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn z-[60]">
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center space-x-3">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 bg-slate-700 hover:bg-slate-600 rounded-full p-1 cursor-pointer border border-slate-600 transition-colors">
                <Camera className="w-3 h-3 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
              <span className="inline-block mt-1 text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-bold border border-blue-500/20">{currentUser.role}</span>
            </div>
          </div>
          <div className="py-1.5">
            <button onClick={() => { setShowUserMenu(false); setShowSettings(true); }} className="w-full px-4 py-2.5 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center space-x-2.5">
              <Settings className="w-4 h-4 text-slate-400" /><span>Paramètres du compte</span>
            </button>
            <button onClick={() => handleNavClick('commercial-management')} className="w-full px-4 py-2.5 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center space-x-2.5">
              <Briefcase className="w-4 h-4 text-slate-400" /><span>Gestion Commerciale</span>
            </button>
            <div className="border-t border-slate-800 my-1"></div>
            <button onClick={() => { closeAll(); onLogout?.(); }} className="w-full px-4 py-2.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center space-x-2.5">
              <LogOut className="w-4 h-4" /><span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}

      {/* Click-away */}
      {(showNotifPanel || showUserMenu || showConnPanel) && (
        <div className="fixed inset-0 z-[55]" onClick={closeAll} />
      )}

      {/* ═══ Settings Modal ═══ */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Paramètres du compte</h2>
              </div>
              <button onClick={() => { setShowSettings(false); setSettingsSaved(false); }} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nom complet</label>
                <input type="text" value={settingsName} onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Adresse e-mail</label>
                <input type="email" value={settingsEmail} onChange={(e) => setSettingsEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Rôle</label>
                <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-400">
                  {currentUser.role} <span className="text-[10px] text-slate-500">(non modifiable)</span>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Changer le mot de passe</p>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Ancien mot de passe</label>
                <input type="password" value={settingsOldPwd} onChange={(e) => setSettingsOldPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Nouveau mot de passe</label>
                <input type="password" value={settingsNewPwd} onChange={(e) => setSettingsNewPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Save feedback */}
            {settingsSaved && (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-bold">Paramètres enregistrés avec succès !</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button onClick={() => { setShowSettings(false); setSettingsSaved(false); }}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                Annuler
              </button>
              <button onClick={() => {
                  // Save to localStorage
                  const session = localStorage.getItem('factureset_session');
                  if (session) {
                    const s = JSON.parse(session);
                    s.name = settingsName;
                    s.email = settingsEmail;
                    localStorage.setItem('factureset_session', JSON.stringify(s));
                  }
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 3000);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all">
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
