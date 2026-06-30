import React, { useState } from 'react';
import { 
  Package, 
  Layers, 
  AlertTriangle, 
  Truck, 
  Users, 
  CreditCard, 
  Store, 
  ShieldCheck, 
  FileSpreadsheet, 
  Search, 
  Plus, 
  Sparkles 
} from 'lucide-react';
import { Product, Category, Supplier, Client, Expense, Caisse, User, Report } from './types';

interface CommercialManagementProps {
  subTab: string;
  onSelectSubTab: (sub: string) => void;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  clients: Client[];
  expenses: Expense[];
  caisses: Caisse[];
  users: User[];
  reports: Report[];
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  onAddProduct: (prod: Product) => void;
  onAddClient: (cli: Client) => void;
  onAddExpense: (exp: Expense) => void;
}

export const CommercialManagement: React.FC<CommercialManagementProps> = ({
  subTab,
  onSelectSubTab,
  products,
  categories,
  suppliers,
  clients,
  expenses,
  caisses,
  users,
  reports,
  onTriggerToast,
  onAddProduct,
  onAddClient,
  onAddExpense
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'product' | 'client' | 'expense'>('product');

  // Modal Form States
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(1000);
  const [prodStock, setProdStock] = useState(50);
  const [prodCat, setProdCat] = useState('cat-1');

  const [cliName, setCliName] = useState('');
  const [cliPhone, setCliPhone] = useState('');
  const [cliIfu, setCliIfu] = useState('');
  const [cliRccm, setCliRccm] = useState('');

  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState(10000);
  const [expCat, setExpCat] = useState('Fournitures');

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
  };

  const tabs = [
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'categories', label: 'Catégories', icon: Layers },
    { id: 'stock', label: 'Stock & Alertes IA', icon: AlertTriangle },
    { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'expenses', label: 'Dépenses', icon: CreditCard },
    { id: 'caisses', label: 'Caisses', icon: Store },
    { id: 'users', label: 'Utilisateurs & Permissions', icon: ShieldCheck },
    { id: 'reports', label: 'Rapports Fiscaux', icon: FileSpreadsheet },
  ];

  const handleOpenAddModal = (type: 'product' | 'client' | 'expense') => {
    setModalType(type);
    setShowModal(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'product') {
      if (!prodName) {
        onTriggerToast('Veuillez entrer un nom de produit', 'warning');
        return;
      }
      const catObj = categories.find(c => c.id === prodCat) || categories[0];
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: prodName,
        categoryId: catObj.id,
        categoryName: catObj.name,
        sku: `PRD-${Math.floor(Math.random()*9000)+1000}`,
        price: Number(prodPrice),
        costPrice: Number(prodPrice) * 0.75,
        stock: Number(prodStock),
        minStock: 10,
        supplierId: suppliers[0].id,
        supplierName: suppliers[0].name,
        aiPopularity: 'Moyenne'
      };
      onAddProduct(newProd);
      setProdName('');
      setProdPrice(1000);
      setProdStock(50);
      onTriggerToast(`Produit ajouté : ${newProd.name}`, 'success');
    } else if (modalType === 'client') {
      if (!cliName) {
        onTriggerToast('Veuillez entrer un nom de client', 'warning');
        return;
      }
      const newCli: Client = {
        id: `cli-${Date.now()}`,
        name: cliName,
        phone: cliPhone || '+225 00 00 00 00',
        email: `${cliName.toLowerCase().replace(/\s+/g, '')}@client.ci`,
        address: 'Abidjan, Côte d\'Ivoire',
        ifu: cliIfu || '',
        rccm: cliRccm || '',
        totalSpent: 0,
        invoiceCount: 0,
        loyaltyStatus: 'Nouveau'
      };
      onAddClient(newCli);
      setCliName('');
      setCliPhone('');
      setCliIfu('');
      setCliRccm('');
      onTriggerToast(`Client créé : ${newCli.name}`, 'success');
    } else if (modalType === 'expense') {
      if (!expTitle) {
        onTriggerToast('Veuillez entrer un libellé de dépense', 'warning');
        return;
      }
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        title: expTitle,
        category: expCat,
        amount: Number(expAmount),
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Espèces',
        authorizedBy: 'Gérant',
        notes: 'Dépense enregistrée via le module SaaS'
      };
      onAddExpense(newExp);
      setExpTitle('');
      setExpAmount(10000);
      onTriggerToast(`Dépense enregistrée : ${formatFCFA(newExp.amount)}`, 'success');
    }
    setShowModal(false);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Store className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Gestion Commerciale & ERP SaaS</h1>
          </div>
          <p className="text-xs text-slate-500">
            Gérez vos stocks, clients, fournisseurs, dépenses et utilisateurs avec assistance IA intégrée.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenAddModal('product')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>+ Produit</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('client')}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>+ Client</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('expense')}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4 text-rose-400" />
            <span>+ Dépense</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectSubTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'stock' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block ml-1"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      {['products', 'clients', 'suppliers', 'expenses'].includes(subTab) && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, SKU ou contact..."
            className="w-full bg-transparent text-xs text-slate-800 font-medium focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
              Effacer
            </button>
          )}
        </div>
      )}

      {/* TAB CONTENT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* 1. PRODUITS */}
        {subTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Produit & SKU</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4 text-right">Prix Vente</th>
                  <th className="py-3 px-4 text-right">Prix Achat</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">IA Recommandation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{p.sku}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{p.categoryName}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-blue-600">{formatFCFA(p.price)}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-600">{formatFCFA(p.costPrice)}</td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded ${p.stock <= p.minStock ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {p.aiRecommendedPrice ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold inline-flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>Prix suggéré: {formatFCFA(p.aiRecommendedPrice)}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Prix optimal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. CATÉGORIES */}
        {subTab === 'categories' && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50">
            {categories.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {c.itemCount} produits
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{c.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
                <button
                  onClick={() => onSelectSubTab('products')}
                  className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold hover:underline"
                >
                  <span>Gérer les produits</span>
                  <span>&rarr;</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. STOCK & ALERTES IA */}
        {subTab === 'stock' && (
          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Alerte IA Rupture de Stock</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  L'intelligence artificielle a détecté que les produits ci-dessous seront en rupture d'ici 3 à 5 jours selon la vitesse d'écoulement actuelle.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Produit en Alerte</th>
                    <th className="py-3 px-4">Fournisseur</th>
                    <th className="py-3 px-4 text-center">Stock Actuel</th>
                    <th className="py-3 px-4 text-center">Seuil Alerte</th>
                    <th className="py-3 px-4 text-center">Action Requise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.filter(p => p.stock <= p.minStock).map((p) => (
                    <tr key={p.id} className="bg-rose-50/30 hover:bg-rose-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.supplierName}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-rose-600">{p.stock}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-600">{p.minStock}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onTriggerToast(`Commande automatique envoyée à ${p.supplierName}`, 'success')}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all"
                        >
                          Commander (+50 unités)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. FOURNISSEURS */}
        {subTab === 'suppliers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Fournisseur</th>
                  <th className="py-3 px-4">Contact & Téléphone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Produits Fournis</th>
                  <th className="py-3 px-4 text-center">Statut IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-semibold">{s.contactName}</p>
                      <p className="text-[10px] text-slate-400">{s.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{s.email}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg">{s.productsSupplied}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        Fiable (100%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. CLIENTS */}
        {subTab === 'clients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Téléphone & Email</th>
                  <th className="py-3 px-4">IFU / RCCM</th>
                  <th className="py-3 px-4 text-center">Fidélité</th>
                  <th className="py-3 px-4 text-right">Total Dépensé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-semibold">{c.phone}</p>
                      <p className="text-[10px] text-slate-400">{c.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      <p className="text-[10px]">{c.ifu || '—'}</p>
                      {c.rccm && <p className="text-[9px] text-slate-400 mt-0.5">{c.rccm}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] ${
                        c.loyaltyStatus === 'VIP' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        c.loyaltyStatus === 'Régulier' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.loyaltyStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">{formatFCFA(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. DÉPENSES */}
        {subTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Libellé & Notes</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4 text-center">Date</th>
                  <th className="py-3 px-4 text-center">Paiement</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{e.title}</p>
                      <p className="text-[10px] text-slate-500">{e.notes}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{e.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500">{e.date}</td>
                    <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{e.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-600">{formatFCFA(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. CAISSES */}
        {subTab === 'caisses' && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50">
            {caisses.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Store className="w-5 h-5 text-blue-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">{c.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'Ouverte' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Caissier :</span>
                    <span className="font-bold text-slate-800">{c.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fond Initial :</span>
                    <span className="font-semibold">{formatFCFA(c.initialAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-extrabold text-slate-900 text-sm">
                    <span>Solde Actuel :</span>
                    <span className="text-blue-600">{formatFCFA(c.currentAmount)}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => onTriggerToast(`Clôture de la caisse ${c.name} en cours...`, 'info')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm"
                  >
                    Clôturer la Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 8. UTILISATEURS & PERMISSIONS */}
        {subTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Utilisateur & Email</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Permissions Clés</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <p>{u.name}</p>
                      <p className="text-[10px] text-slate-500 font-normal">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">{u.role}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {u.permissions.map((perm, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 9. RAPPORTS FISCAUX */}
        {subTab === 'reports' && (
          <div className="p-6 space-y-4 bg-slate-50/50">
            {reports.map((r) => (
              <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {r.type}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">{r.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{r.summary}</p>
                  <p className="text-[10px] text-slate-400 pt-1">Généré le {r.generatedAt} par {r.generatedBy}</p>
                </div>
                <button
                  onClick={() => onTriggerToast(`Export du rapport ${r.title} vers PDF & Excel...`, 'success')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1 shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exporter (PDF / Excel)</span>
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL AJOUT (PRODUIT / CLIENT / DÉPENSE) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {modalType === 'product' ? 'Ajouter un Nouveau Produit' :
                 modalType === 'client' ? 'Créer un Compte Client' : 'Enregistrer une Dépense'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {modalType === 'product' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nom du Produit</label>
                    <input
                      type="text"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="Ex: Riz Parfumé 25kg"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Prix de Vente (FCFA)</label>
                      <input
                        type="number"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Stock Initial</label>
                      <input
                        type="number"
                        value={prodStock}
                        onChange={(e) => setProdStock(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Catégorie</label>
                    <select
                      value={prodCat}
                      onChange={(e) => setProdCat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {modalType === 'client' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nom du Client / Raison Sociale</label>
                    <input
                      type="text"
                      value={cliName}
                      onChange={(e) => setCliName(e.target.value)}
                      placeholder="Ex: Supermarché Le Panier"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={cliPhone}
                      onChange={(e) => setCliPhone(e.target.value)}
                      placeholder="+225 01 02 03 04"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">IFU (N° Contribuable)</label>
                    <input
                      type="text"
                      value={cliIfu}
                      onChange={(e) => setCliIfu(e.target.value)}
                      placeholder="CI-2026-XXXXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">RCCM</label>
                    <input
                      type="text"
                      value={cliRccm}
                      onChange={(e) => setCliRccm(e.target.value)}
                      placeholder="CI-ABJ-XX-XXXX-BXX-XXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {modalType === 'expense' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Libellé de la Dépense</label>
                    <input
                      type="text"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="Ex: Achat fournitures bureau"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Montant (FCFA)</label>
                    <input
                      type="number"
                      value={expAmount}
                      onChange={(e) => setExpAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Catégorie</label>
                    <select
                      value={expCat}
                      onChange={(e) => setExpCat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Fournitures">Fournitures de bureau</option>
                      <option value="Charges d'exploitation">Charges d'exploitation</option>
                      <option value="Informatique & SaaS">Informatique & SaaS</option>
                      <option value="Logistique">Logistique</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
