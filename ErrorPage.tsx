import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ 
  message = "Une erreur est survenue lors du chargement de l'application.",
  onRetry,
  onGoHome 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Problème de chargement</h2>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Réessayer</span>
            </button>
          )}
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 border border-slate-700"
            >
              <Home className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </button>
          )}
        </div>
        <p className="text-xs text-slate-600 mt-6">
          Si le problème persiste, essayez de vider le cache de votre navigateur (Ctrl+Shift+R).
        </p>
      </div>
    </div>
  );
};
