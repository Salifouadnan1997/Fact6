import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] getDerivedStateFromError:', error.message);
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] componentDidCatch - Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    console.log('[ErrorBoundary] Resetting error state');
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Nettoyer le localStorage en cas d'erreur de session
    try {
      localStorage.removeItem('factureset_session');
      localStorage.removeItem('factureset_active_tab');
    } catch (e) {
      console.error('[ErrorBoundary] Error clearing localStorage:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-slate-600 mb-6">
              L'application a rencontré un problème inattendu. Veuillez réessayer.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-slate-100 rounded-lg p-3 mb-4 text-left text-xs text-red-600 overflow-auto max-h-32">
                <p className="font-bold mb-1">Erreur technique :</p>
                <p>{this.state.error.message}</p>
                {this.state.errorInfo && (
                  <p className="mt-2 text-slate-500">{this.state.errorInfo.componentStack}</p>
                )}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
