import { useState } from 'react';
import { Sparkles, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, UserPlus, CheckCircle2, Globe } from 'lucide-react';
import { t, getLang, setLang } from '../config/i18n';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onBack?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const resetFields = () => {
    setEmail(''); setPassword(''); setRegName(''); setRegEmail('');
    setRegPassword(''); setRegConfirm(''); setError(''); setSuccess('');
  };

  const switchMode = (m: 'login' | 'register') => {
    resetFields();
    setMode(m);
  };

  // ── LOGIN ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim() || !password.trim()) { setError('Veuillez remplir tous les champs.'); return; }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      setError(error.message || 'Email ou mot de passe incorrect.');
    } else {
      setSuccess('Connexion réussie !');
    }
  };

  // ── REGISTER ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirm) {
      setError('Veuillez remplir tous les champs.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setError('Adresse e-mail invalide.'); return;
    }
    if (regPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.'); return;
    }
    if (regPassword !== regConfirm) {
      setError('Les mots de passe ne correspondent pas.'); return;
    }

    setIsLoading(true);
    const { error } = await signUp(regEmail, regPassword, regName);
    setIsLoading(false);

    if (error) {
      setError(error.message || 'Erreur lors de l\'inscription.');
    } else {
      setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        setEmail(regEmail);
        switchMode('login');
        setSuccess('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-2xl shadow-blue-600/30 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide">
            FACTURE<span className="text-blue-400">set</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">{t('app.tagline')}</p>
          {/* Language Switcher */}
          <button onClick={() => { setLang(getLang() === 'fr' ? 'en' : 'fr'); window.location.reload(); }}
            className="mt-3 inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700">
            <Globe className="w-3.5 h-3.5" /><span>{getLang() === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          
          {/* Tabs: Login / Register */}
          <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
            <button onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}>
              <LogIn className="w-4 h-4" /><span>{t('btn.login')}</span>
            </button>
            <button onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'register' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}>
              <UserPlus className="w-4 h-4" /><span>{t('btn.register')}</span>
            </button>
          </div>

          {/* ═══ LOGIN FORM ═══ */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-bold text-white">Connexion sécurisée</h2>
                </div>
                {onBack && (
                  <button type="button" onClick={onBack} className="text-slate-400 hover:text-white text-xs font-bold flex items-center space-x-1">
                    <span>Retour</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Adresse e-mail</label>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="votre@email.com" autoComplete="email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••" autoComplete="current-password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start space-x-2.5 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start space-x-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-400 font-medium">{success}</p>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 text-sm">
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Connexion...</span></>
                ) : (
                  <><LogIn className="w-4 h-4" /><span>Se connecter</span></>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-3 text-slate-500">Ou continuer avec</span></div>
              </div>

              <button type="button" onClick={() => signInWithGoogle()}
                className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>Google</span>
              </button>

              <p className="text-center text-xs text-slate-500 mt-4">
                Pas encore de compte ?{' '}
                <button type="button" onClick={() => switchMode('register')} className="text-blue-400 hover:text-blue-300 font-bold">
                  Créer un compte
                </button>
              </p>
            </form>
          )}

          {/* ═══ REGISTER FORM ═══ */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Créer un compte</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nom complet</label>
                <input type="text" value={regName} onChange={(e) => { setRegName(e.target.value); setError(''); }}
                  placeholder="Votre nom et prénom" autoComplete="name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Adresse e-mail</label>
                <input type="email" value={regEmail} onChange={(e) => { setRegEmail(e.target.value); setError(''); }}
                  placeholder="votre@email.com" autoComplete="email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showRegPassword ? 'text' : 'password'} value={regPassword}
                    onChange={(e) => { setRegPassword(e.target.value); setError(''); }}
                    placeholder="Minimum 6 caractères" autoComplete="new-password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirmer le mot de passe</label>
                <input type="password" value={regConfirm} onChange={(e) => { setRegConfirm(e.target.value); setError(''); }}
                  placeholder="Retapez le mot de passe" autoComplete="new-password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              {error && (
                <div className="flex items-start space-x-2.5 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start space-x-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-400 font-medium">{success}</p>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 text-sm">
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Création en cours...</span></>
                ) : (
                  <><UserPlus className="w-4 h-4" /><span>Créer mon compte</span></>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 mt-3">
                Déjà un compte ?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-blue-400 hover:text-blue-300 font-bold">
                  Se connecter
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Besoin de solution digital? Contact: <span className="text-blue-400 font-semibold">+2290166336546</span>
          </p>
          <p className="text-[10px] text-slate-600 mt-1">© 2026 FACTUREset — Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};
