import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Shield, ShieldCheck, ShieldAlert, Ban, Save, X, Search, Users, UserCheck, UserX, Calendar, CreditCard } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'blocked';
  isActive: boolean;
  subscription?: string;
  expirationDate?: string;
}

interface SupplierManagementProps {
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const SupplierManagement: React.FC<SupplierManagementProps> = ({ onTriggerToast }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', contact: '', email: '', role: 'viewer' as Supplier['role'], subscription: 'Gratuit', expirationDate: ''
  });

  useEffect(() => {
    // Load registered users from login system
    const registeredUsersStr = localStorage.getItem('factureset_users');
    const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];
    
    // Load admin-edited supplier data (subscriptions, roles)
    const savedSuppliersStr = localStorage.getItem('factureset_suppliers');
    const savedSuppliers = savedSuppliersStr ? JSON.parse(savedSuppliersStr) : [];

    // Merge: Start with registered users, apply admin edits
    let merged: Supplier[] = registeredUsers.map((u: any) => ({
      id: u.email, // Use email as unique ID to match
      name: u.name,
      contact: u.contact || '',
      email: u.email,
      role: u.role === 'Administrateur' ? 'admin' : 'editor',
      isActive: true,
      subscription: 'Gratuit',
      expirationDate: ''
    }));

    // Apply admin customizations
    savedSuppliers.forEach((adminSupplier: Supplier) => {
      const idx = merged.findIndex(s => s.email === adminSupplier.email);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...adminSupplier };
      } else {
        merged.push(adminSupplier); // Add manually created suppliers
      }
    });

    setSuppliers(merged);
  }, []);

  useEffect(() => {
    if (suppliers.length > 0) {
      localStorage.setItem('factureset_suppliers', JSON.stringify(suppliers));
    }
  }, [suppliers]);

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData({ 
        name: supplier.name, 
        contact: supplier.contact, 
        email: supplier.email, 
        role: supplier.role,
        subscription: supplier.subscription || 'Gratuit',
        expirationDate: supplier.expirationDate || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', contact: '', email: '', role: 'viewer', subscription: 'Gratuit', expirationDate: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      onTriggerToast('Veuillez remplir le nom et l\'email', 'warning');
      return;
    }
    if (editingId) {
      setSuppliers(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } : s));
      onTriggerToast('Fournisseur modifié avec succès', 'success');
    } else {
      const newSupplier: Supplier = { id: Date.now().toString(), ...formData, isActive: true };
      setSuppliers(prev => [...prev, newSupplier]);
      onTriggerToast('Fournisseur ajouté avec succès', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      onTriggerToast('Fournisseur supprimé', 'info');
    }
  };

  const toggleStatus = (id: string) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: Supplier['role']) => {
    switch (role) {
      case 'admin': return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200"><ShieldCheck className="w-3 h-3"/> Admin</span>;
      case 'editor': return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200"><Shield className="w-3 h-3"/> Éditeur</span>;
      case 'viewer': return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"><ShieldAlert className="w-3 h-3"/> Lecture</span>;
      case 'blocked': return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200"><Ban className="w-3 h-3"/> Bloqué</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><Users className="w-6 h-6 text-blue-400"/> Gestion des Fournisseurs</h1>
          <p className="text-sm text-slate-400 mt-1">Gérez les accès, les autorisations et les données de vos fournisseurs.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4"/> Ajouter un fournisseur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div><p className="text-xs font-bold text-slate-500 uppercase">Total Fournisseurs</p><p className="text-2xl font-black text-slate-900">{suppliers.length}</p></div>
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Users className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div><p className="text-xs font-bold text-slate-500 uppercase">Comptes Actifs</p><p className="text-2xl font-black text-emerald-600">{suppliers.filter(s => s.isActive).length}</p></div>
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600"><UserCheck className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div><p className="text-xs font-bold text-slate-500 uppercase">Comptes Bloqués</p><p className="text-2xl font-black text-rose-600">{suppliers.filter(s => !s.isActive || s.role === 'blocked').length}</p></div>
          <div className="bg-rose-50 p-3 rounded-lg text-rose-600"><UserX className="w-6 h-6"/></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
            <input type="text" placeholder="Rechercher un fournisseur..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4">Fournisseur</th>
                <th className="px-4 py-4">Abonnement</th>
                <th className="px-4 py-4">Expiration</th>
                <th className="px-4 py-4">Autorisation</th>
                <th className="px-4 py-4">Statut</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{supplier.name}</div>
                    <div className="text-xs text-slate-500">{supplier.email}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 w-fit">
                      <CreditCard className="w-3 h-3"/> {supplier.subscription || 'Gratuit'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 text-xs">
                    {supplier.expirationDate ? (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {supplier.expirationDate}</span>
                    ) : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-4 py-4">{getRoleBadge(supplier.role)}</td>
                  <td className="px-4 py-4">
                    <button onClick={() => toggleStatus(supplier.id)} className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${supplier.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {supplier.isActive ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(supplier)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(supplier.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Supprimer"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Aucun fournisseur trouvé.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nom de l'entreprise</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Tech Solutions" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Téléphone</label>
                  <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+229..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="contact@entreprise.com" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Niveau d'autorisation</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Supplier['role']})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="viewer">Lecture seule (Consulter les factures)</option>
                  <option value="editor">Éditeur (Créer et modifier)</option>
                  <option value="admin">Administrateur (Accès total)</option>
                  <option value="blocked">Bloqué (Aucun accès)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><CreditCard className="w-3 h-3"/> Abonnement</label>
                  <select value={formData.subscription} onChange={e => setFormData({...formData, subscription: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Gratuit">Gratuit</option>
                    <option value="Starter">Starter (5000 FCFA)</option>
                    <option value="Business">Business (14900 FCFA)</option>
                    <option value="Pack CV">Pack CV (1000 FCFA)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> Date d'expiration</label>
                  <input type="date" value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-sm font-bold transition-colors">Annuler</button>
              <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all">
                <Save className="w-4 h-4"/> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
