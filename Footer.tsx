import { t } from './src/config/i18n';

interface FooterProps {
  onNavigate: (tab: any) => void;
  onLangChange: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">{t('footer.about')}</button>
          <span className="text-slate-700">|</span>
          <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">{t('footer.privacy')}</button>
          <span className="text-slate-700">|</span>
          <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">{t('footer.terms')}</button>
          <span className="text-slate-700">|</span>
          <a href="mailto:Salifouadnan1997@gmail.com" className="hover:text-white transition-colors">{t('footer.contact')}</a>
        </div>
        <div className="text-center mt-4 pt-4 border-t border-slate-800">
          <p className="text-[10px] text-slate-500">{t('app.rights')}</p>
          <p className="text-[10px] text-slate-600 mt-1">{t('app.contact')} <span className="text-blue-400">+2290166336546</span></p>
        </div>
      </div>
    </footer>
  );
};
