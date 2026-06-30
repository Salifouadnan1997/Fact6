import { t } from './src/config/i18n';
import { Shield, FileText, Users, Lock, Scale, Heart } from 'lucide-react';

interface LegalPageProps { page: 'about' | 'privacy' | 'terms'; }

export const LegalPage: React.FC<LegalPageProps> = ({ page }) => {
  if (page === 'about') return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-2 mb-2"><Heart className="w-6 h-6 text-blue-400" /><h1 className="text-2xl font-extrabold">{t('about.title')}</h1></div>
        <p className="text-sm text-slate-300">{t('about.desc')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2"><Users className="w-5 h-5 text-blue-600" /><h2 className="text-lg font-bold">{t('about.mission')}</h2></div>
        <p className="text-sm text-slate-600 leading-relaxed">{t('about.missionText')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2"><Shield className="w-5 h-5 text-blue-600" /><h2 className="text-lg font-bold">{t('about.features')}</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['📄 Factures normalisées','📋 Quittances professionnelles','✍️ Signature électronique','📑 Signature de documents','🤖 CV intelligent IA','🔧 Cachets personnalisés','📊 Gestion commerciale ERP','💰 Wallet multidevise','🎯 50+ templates','📦 Export PDF/Excel','🔐 Sécurité avancée','🌍 Multi-langues'].map((f,i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-700 border border-slate-200">{f}</div>
          ))}
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2"><Users className="w-5 h-5 text-blue-600" /><h2 className="text-lg font-bold">{t('about.team')}</h2></div>
        <p className="text-sm text-slate-600 leading-relaxed">{t('about.teamText')}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
          <p className="font-bold">SALIFOU Adnana — Fondateur & Développeur</p>
          <p>Email: Salifouadnan1997@gmail.com | Tél: +2290166336546</p>
          <p>Site: https://factureset.com</p>
        </div>
      </div>
    </div>
  );

  if (page === 'privacy') return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-2 mb-2"><Lock className="w-6 h-6 text-emerald-400" /><h1 className="text-2xl font-extrabold">{t('privacy.title')}</h1></div>
        <p className="text-sm text-slate-300">{t('privacy.intro')}</p>
      </div>
      {[
        { icon: FileText, title: t('privacy.collect'), text: t('privacy.collectText') },
        { icon: Shield, title: t('privacy.use'), text: t('privacy.useText') },
        { icon: Lock, title: t('privacy.security'), text: t('privacy.securityText') },
        { icon: Users, title: t('privacy.rights'), text: t('privacy.rightsText') },
      ].map((s, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2"><s.icon className="w-5 h-5 text-emerald-600" /><h2 className="text-lg font-bold">{s.title}</h2></div>
          <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
        </div>
      ))}
      <p className="text-xs text-slate-400 text-center">Dernière mise à jour : Mai 2026 | Contact : Salifouadnan1997@gmail.com</p>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-2 mb-2"><Scale className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-extrabold">{t('terms.title')}</h1></div>
        <p className="text-sm text-slate-300">{t('terms.intro')}</p>
      </div>
      {[
        { title: t('terms.service'), text: t('terms.serviceText') },
        { title: t('terms.account'), text: t('terms.accountText') },
        { title: t('terms.payment'), text: t('terms.paymentText') },
        { title: t('terms.ip'), text: t('terms.ipText') },
        { title: t('terms.liability'), text: t('terms.liabilityText') },
        { title: t('terms.modification'), text: t('terms.modificationText') },
      ].map((s, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900">{i + 1}. {s.title}</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
        </div>
      ))}
      <p className="text-xs text-slate-400 text-center">Dernière mise à jour : Mai 2026 | Contact : Salifouadnan1997@gmail.com</p>
    </div>
  );
};
