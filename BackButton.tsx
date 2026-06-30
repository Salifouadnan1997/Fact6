import { ArrowLeft } from 'lucide-react';
import { t } from './src/config/i18n';

interface BackButtonProps {
  onBack: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onBack, label }) => (
  <button onClick={onBack}
    className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4 group">
    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
    <span>{label || t('btn.back')}</span>
  </button>
);
