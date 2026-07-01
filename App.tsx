import { useState, useEffect } from 'react';
import { initPerformance } from './performance';
import { LandingPage } from './LandingPage';
import { Navbar } from './Navbar';
import { Sidebar, TabType } from './Sidebar';
import { Dashboard } from './Dashboard';
import { InvoiceGenerator } from './InvoiceGenerator';
import { CustomizerAndTemplates } from './CustomizerAndTemplates';
import { AIAssistant } from './AIAssistant';
import { CommercialManagement } from './CommercialManagement';
import { PrintAndExport } from './PrintAndExport';
import { StampSignature } from './StampSignature';
import { QuittanceGenerator } from './QuittanceGenerator';
import { DocumentSigner } from './DocumentSigner';
import { BackButton } from './BackButton';
import { SubscriptionPage } from './SubscriptionPage';
import { Wallet } from './Wallet';
import { Affiliation } from './Affiliation';
import { Projects } from './Projects';
import { CVGenerator } from './CVGenerator';
import { CompanySettings } from './CompanySettings';
import { SupplierManagement } from './SupplierManagement';
import { Footer } from './Footer';
import { LegalPage } from './LegalPages';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorPage } from './ErrorPage';
import { AuthProvider, useAuth } from './AuthContext';

import { 
  INITIAL_TEMPLATES, 
  INITIAL_CATEGORIES, 
  INITIAL_SUPPLIERS, 
  INITIAL_PRODUCTS, 
  INITIAL_CLIENTS, 
  INITIAL_EXPENSES, 
  INITIAL_CAISSES, 
  INITIAL_USERS, 
  INITIAL_REPORTS, 
  INITIAL_AI_ANALYTICS, 
  DEFAULT_INVOICE 
} from './mockData';

import { 
  Template, Product, Category, Supplier, Client, Expense, 
  Caisse, User, Report, AIAnalytics, Invoice 
} from './types';

// ── Auth session type ──
interface AuthSession {
  email: string;
  name: string;
  role: string;
  loginAt: string;
  token: string;
}

function AppContent() {
  const { user, signOut, loading, userRole, error: authError } = useAuth();

  console.log('[App] rendering - user:', user?.email ?? 'null', 'loading:', loading, 'userRole:', userRole, 'authError:', authError);

  useEffect(() => { initPerformance(); }, []);

  const handleLogout = () => { signOut(); };
  const handleRetry = () => { window.location.reload(); };
  const handleGoHome = () => { window.location.href = '/'; };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 text-sm font-medium">Chargement de FACTUREset...</p>
      </div>
    );
  }

  if (authError) {
    console.error('[App] Auth error:', authError);
    return <ErrorPage message={authError} onRetry={handleRetry} onGoHome={handleGoHome} />;
  }

  if (!user) {
    return <LandingPage />;
  }

  const authUser: AuthSession = {
    email: user.email || '',
    name: user.user_metadata.full_name || user.email || 'Utilisateur',
    role: userRole === 'admin' ? 'Administrateur' : 'user',
    loginAt: new Date().toISOString(),
    token: user.id
  };

  console.log('[App] authUser role:', authUser.role);

  return <AuthenticatedApp authUser={authUser} onLogout={handleLogout} />;
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

// ══════════════════════════════════════════
// Authenticated App (separated to avoid re-renders on login state change)
// ══════════════════════════════════════════
function AuthenticatedApp({ authUser, onLogout }: { authUser: AuthSession; onLogout: () => void }) {
  // Restore last active tab from session
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try { const s = localStorage.getItem('factureset_active_tab'); return (s as TabType) || 'dashboard'; } catch { return 'dashboard'; }
  });
  const [commercialSubTab, setCommercialSubTab] = useState<string>('products');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Application States
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [caisses] = useState<Caisse[]>(INITIAL_CAISSES);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [reports] = useState<Report[]>(INITIAL_REPORTS);
  const [analytics, setAnalytics] = useState<AIAnalytics>(INITIAL_AI_ANALYTICS);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(DEFAULT_INVOICE);

  // Build current user from auth session
  const currentUser: User = {
    id: authUser.token,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role as User['role'],
    status: 'Actif',
    permissions: authUser.role === 'Administrateur' 
      ? ['Tout configurer', 'Gérer utilisateurs', 'Valider dépenses', 'Exporter rapports', 'Accès IA Complet', 'Admin Panel']
      : authUser.role === 'Gérant'
      ? ['Gérer stocks', 'Gérer clients', 'Créer factures', 'Accès IA Commercial']
      : ['Créer factures', 'Imprimer tickets'],
  };

  // Active Caisse - protection si caisses est vide
  const [activeCaisseId, setActiveCaisseId] = useState<string>('caisse-1');
  const defaultCaisse: Caisse = { id: 'caisse-default', name: 'Caisse Principale', status: 'Ouverte', openedAt: new Date().toISOString(), initialAmount: 0, currentAmount: 0, cashierName: authUser.name };
  const activeCaisse = caisses.find(c => c.id === activeCaisseId) || caisses[0] || defaultCaisse;

  console.log('[AuthenticatedApp] DEBUG: rendering - activeTab:', activeTab, 'caisses count:', caisses.length, 'activeCaisse:', activeCaisse?.name);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => { setToast(null); }, 3500);
  };

  const handleNavigateToTab = (tab: TabType, subTab?: string) => {
    setActiveTab(tab);
    if (subTab) setCommercialSubTab(subTab);
    setIsMobileMenuOpen(false);
    // Save active tab for session persistence
    localStorage.setItem('factureset_active_tab', tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CRUD Handlers
  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
    setCategories(prev => prev.map(c => c.id === newProd.categoryId ? { ...c, itemCount: c.itemCount + 1 } : c));
  };
  const handleAddClient = (newCli: Client) => { setClients(prev => [newCli, ...prev]); };
  const handleAddExpense = (newExp: Expense) => {
    setExpenses(prev => [newExp, ...prev]);
    setAnalytics(prev => ({ ...prev, totalExpenses: prev.totalExpenses + newExp.amount }));
  };
  const handleAddNewCustomTemplate = (newTpl: Template) => { setTemplates(prev => [newTpl, ...prev]); };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-toastIn flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold backdrop-blur-md"
          style={{
            backgroundColor: toast.type === 'success' ? 'rgba(5,150,105,0.95)' : toast.type === 'warning' ? 'rgba(217,119,6,0.95)' : 'rgba(37,99,235,0.95)',
            color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)'
          }}>
          <span className="w-2 h-2 rounded-full bg-white/60 animate-dotPulse shrink-0"></span>
          <span className="text-xs">{toast.message}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar 
        activeCaisse={activeCaisse} 
        onSelectCaisse={setActiveCaisseId} 
        caisses={caisses} 
        currentUser={currentUser} 
        activeTab={activeTab}
        onSelectTab={(tab) => handleNavigateToTab(tab)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onLogout={onLogout}
      />

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={(tab) => handleNavigateToTab(tab)} 
          commercialSubTab={commercialSubTab} 
          onSelectCommercialSubTab={setCommercialSubTab} 
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          isAdmin={currentUser.role === 'Administrateur'}
        />

        <main className="flex-1 overflow-y-auto pb-12">
          {activeTab !== 'dashboard' && (
            <div className="px-4 sm:px-6 pt-4">
              <BackButton onBack={() => handleNavigateToTab('dashboard')} />
            </div>
          )}
          {activeTab === 'dashboard' && (
            <Dashboard onNavigateToTab={handleNavigateToTab} />
          )}
          {activeTab === 'projects' && (
            <Projects currentInvoice={currentInvoice} onRestoreInvoice={setCurrentInvoice} onTriggerToast={triggerToast} onNavigateToTab={handleNavigateToTab} />
          )}
          {activeTab === 'invoice-generator' && (
            <InvoiceGenerator 
              currentInvoice={currentInvoice} onChangeInvoice={setCurrentInvoice} 
              products={products} clients={clients} templates={templates} userId={currentUser.id} onTriggerToast={triggerToast} 
            />
          )}
          {activeTab === 'quittance-generator' && (
            <QuittanceGenerator currentInvoice={currentInvoice} userId={currentUser.id} onTriggerToast={triggerToast} />
          )}
          {activeTab === 'customizer-templates' && (
            <CustomizerAndTemplates 
              templates={templates} currentInvoice={currentInvoice} onChangeInvoice={setCurrentInvoice} 
              onTriggerToast={triggerToast} onAddNewCustomTemplate={handleAddNewCustomTemplate} 
            />
          )}
          {activeTab === 'stamp-signature' && (
            <StampSignature currentInvoice={currentInvoice} onChangeInvoice={setCurrentInvoice} onTriggerToast={triggerToast} />
          )}
          {activeTab === 'document-signer' && (
            <DocumentSigner currentInvoice={currentInvoice} onTriggerToast={triggerToast} />
          )}
          {activeTab === 'ai-assistant' && (
            <AIAssistant products={products} analytics={analytics} onNavigateToTab={handleNavigateToTab} onTriggerToast={triggerToast} />
          )}
          {activeTab === 'commercial-management' && (
            <CommercialManagement 
              subTab={commercialSubTab} onSelectSubTab={setCommercialSubTab} 
              products={products} categories={categories} suppliers={suppliers} clients={clients} 
              expenses={expenses} caisses={caisses} users={users} reports={reports} 
              onTriggerToast={triggerToast} onAddProduct={handleAddProduct} onAddClient={handleAddClient} onAddExpense={handleAddExpense} 
            />
          )}
          {activeTab === 'print-export' && (
            <PrintAndExport currentInvoice={currentInvoice} onTriggerToast={triggerToast} />
          )}
          {activeTab === 'wallet' && (
            <Wallet onTriggerToast={triggerToast} />
          )}
          {activeTab === 'subscription' && (
            <SubscriptionPage onTriggerToast={triggerToast} userEmail={authUser.email} userName={authUser.name} />
          )}
          {activeTab === 'affiliation' && (
            <Affiliation onTriggerToast={triggerToast} userEmail={authUser.email} userName={authUser.name} />
          )}
          {activeTab === 'cv-generator' && (
            <CVGenerator onTriggerToast={triggerToast} />
          )}
          {activeTab === 'company-settings' && (
            <CompanySettings onTriggerToast={triggerToast} />
          )}
          {activeTab === 'supplier-management' && currentUser.role === 'Administrateur' && (
            <SupplierManagement onTriggerToast={triggerToast} />
          )}
            {activeTab === 'admin-panel' && currentUser.role === 'Administrateur' && (
              <SupplierManagement onTriggerToast={triggerToast} />
            )}
          {activeTab === 'about' && <LegalPage page="about" />}
          {activeTab === 'privacy' && <LegalPage page="privacy" />}
          {activeTab === 'terms' && <LegalPage page="terms" />}
        </main>
      </div>
      <Footer onNavigate={handleNavigateToTab} onLangChange={() => window.location.reload()} />
    </div>
  );
}

export default App;
