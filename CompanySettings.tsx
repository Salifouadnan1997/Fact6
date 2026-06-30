import { useState, useEffect } from 'react';
import { Save, Building2, Trash2, CheckCircle2 } from 'lucide-react';

interface CompanySettingsProps {
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({ onTriggerToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    ninea: '',
    rccm: '',
    website: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('factureset_company_info');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('factureset_company_info', JSON.stringify(formData));
    onTriggerToast('Informations entreprise sauvegardées !', 'success');
  };

  const handleClear = () => {
    if (window.confirm('Voulez-vous vraiment effacer ces informations ?')) {
      localStorage.removeItem('factureset_company_info');
      setFormData({ name: '', address: '', phone: '', email: '', ninea: '', rccm: '', website: '' });
      onTriggerToast('Informations effacées.', 'info');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <Building2 className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-extrabold">Paramètres de l'Entreprise</h1>
        </div>
        <p className="text-sm text-slate-300">Configurez vos informations une fois. Elles seront automatiquement pré-remplies dans vos futures factures et quittances.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600"/> Identité de l'entreprise</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nom de l'entreprise</label>
            <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: FACTUREset SARL" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Site Web</label>
            <input type="text" value={formData.website} onChange={e => handleChange('website', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="www.factureset.com" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Adresse complète</label>
          <input type="text" value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Quartier, Ville, Pays" />
        </div>

        <h2 className="text-lg font-bold text-slate-800 border-b pb-2 pt-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600"/> Contact & Légal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Téléphone</label>
            <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+229 01 XX XX XX XX" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="contact@entreprise.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">NINEA</label>
            <input type="text" value={formData.ninea} onChange={e => handleChange('ninea', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Numéro NINEA" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">RCCM / Registre de Commerce</label>
            <input type="text" value={formData.rccm} onChange={e => handleChange('rccm', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Numéro RCCM" />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <button onClick={handleClear} className="flex items-center space-x-2 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-sm font-bold transition-colors border border-rose-200">
            <Trash2 className="w-4 h-4" /><span>Effacer</span>
          </button>
          <button onClick={handleSave} className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
            <Save className="w-4 h-4" /><span>Enregistrer les informations</span>
          </button>
        </div>
      </div>
    </div>
  );
};
