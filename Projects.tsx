import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Clock, FileText, Receipt, RotateCcw, Save, CheckCircle2 } from 'lucide-react';
import { Invoice } from '../types';

interface SavedProject {
  id: string;
  name: string;
  type: 'facture' | 'quittance';
  data: any;
  createdAt: string;
  updatedAt: string;
  status: 'brouillon' | 'terminé';
}

interface ProjectsProps {
  currentInvoice: Invoice;
  onRestoreInvoice: (inv: Invoice) => void;
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  onNavigateToTab: (tab: any) => void;
}

const STORAGE_KEY = 'factureset_projects';
const AUTOSAVE_KEY = 'factureset_autosave';

function loadProjects(): SavedProject[] {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveProjects(projects: SavedProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export const Projects: React.FC<ProjectsProps> = ({ currentInvoice, onRestoreInvoice, onTriggerToast, onNavigateToTab }) => {
  const [projects, setProjects] = useState<SavedProject[]>(loadProjects);
  const [newName, setNewName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [filter, setFilter] = useState<'all' | 'facture' | 'quittance'>('all');
  const [autoSaved, setAutoSaved] = useState(false);

  // Auto-save current invoice every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentInvoice.items?.length > 0 || currentInvoice.clientName) {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
          type: 'facture',
          data: currentInvoice,
          savedAt: new Date().toISOString(),
        }));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentInvoice]);

  // Check for auto-saved data on mount
  useEffect(() => {
    try {
      const auto = localStorage.getItem(AUTOSAVE_KEY);
      if (auto) {
        const parsed = JSON.parse(auto);
        const age = Date.now() - new Date(parsed.savedAt).getTime();
        if (age < 86400000) { // < 24h
          setAutoSaved(true);
        }
      }
    } catch {}
  }, []);

  const handleSave = (type: 'facture' | 'quittance') => {
    const name = newName.trim() || `${type === 'facture' ? 'Facture' : 'Quittance'} — ${new Date().toLocaleDateString('fr-FR')}`;
    const project: SavedProject = {
      id: `proj-${Date.now()}`,
      name,
      type,
      data: type === 'facture' ? currentInvoice : { type: 'quittance', savedAt: new Date().toISOString() },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'brouillon',
    };
    const updated = [project, ...projects];
    setProjects(updated);
    saveProjects(updated);
    setNewName('');
    setShowSave(false);
    onTriggerToast(`Projet "${name}" enregistré !`, 'success');
  };

  const handleSaveCurrentInvoice = () => {
    const name = `Facture ${currentInvoice.invoiceNumber || ''} — ${new Date().toLocaleDateString('fr-FR')}`;
    const project: SavedProject = {
      id: `proj-${Date.now()}`,
      name,
      type: 'facture',
      data: currentInvoice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: currentInvoice.items?.length > 0 ? 'terminé' : 'brouillon',
    };
    const updated = [project, ...projects];
    setProjects(updated);
    saveProjects(updated);
    onTriggerToast(`Facture sauvegardée !`, 'success');
  };

  const handleRestore = (project: SavedProject) => {
    if (project.type === 'facture') {
      onRestoreInvoice(project.data as Invoice);
      onNavigateToTab('invoice-generator');
      onTriggerToast(`Projet "${project.name}" restauré. Vous pouvez continuer.`, 'success');
    } else {
      onNavigateToTab('quittance-generator');
      onTriggerToast(`Ouvrez le générateur de quittances pour continuer.`, 'info');
    }
  };

  const handleRestoreAutoSave = () => {
    try {
      const auto = localStorage.getItem(AUTOSAVE_KEY);
      if (auto) {
        const parsed = JSON.parse(auto);
        onRestoreInvoice(parsed.data as Invoice);
        onNavigateToTab('invoice-generator');
        onTriggerToast('Projet auto-sauvegardé restauré !', 'success');
      }
    } catch { onTriggerToast('Aucune sauvegarde automatique trouvée', 'warning'); }
  };

  const handleDelete = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
    onTriggerToast('Projet supprimé', 'info');
  };

  const handleMarkComplete = (id: string) => {
    const updated = projects.map(p => p.id === id ? { ...p, status: 'terminé' as const, updatedAt: new Date().toISOString() } : p);
    setProjects(updated);
    saveProjects(updated);
    onTriggerToast('Marqué comme terminé', 'success');
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.type === filter);
  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Mes Projets</h1>
            <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{projects.length} projets</span>
          </div>
          <p className="text-xs text-slate-500">Retrouvez toutes vos réalisations. Sauvegarde automatique toutes les 30 secondes.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleSaveCurrentInvoice}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5">
            <Save className="w-4 h-4" /><span>Sauvegarder facture en cours</span>
          </button>
          <button onClick={() => setShowSave(!showSave)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5">
            <Plus className="w-4 h-4" /><span>Nouveau projet</span>
          </button>
        </div>
      </div>

      {/* Auto-save indicator */}
      {autoSaved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-emerald-800 font-bold">Sauvegarde automatique active</span>
          </div>
          <button onClick={handleRestoreAutoSave} className="text-xs text-emerald-700 hover:underline font-bold flex items-center space-x-1">
            <RotateCcw className="w-3 h-3" /><span>Restaurer dernière auto-sauvegarde</span>
          </button>
        </div>
      )}

      {/* New project form */}
      {showSave && (
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-900">Créer un nouveau projet</h3>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom du projet (optionnel)"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex space-x-3">
            <button onClick={() => handleSave('facture')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5">
              <Receipt className="w-4 h-4" /><span>Projet Facture</span>
            </button>
            <button onClick={() => handleSave('quittance')} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5">
              <FileText className="w-4 h-4" /><span>Projet Quittance</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex space-x-2">
        {(['all', 'facture', 'quittance'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {f === 'all' ? `Tous (${projects.length})` : f === 'facture' ? `📄 Factures (${projects.filter(p=>p.type==='facture').length})` : `📋 Quittances (${projects.filter(p=>p.type==='quittance').length})`}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map(p => (
              <div key={p.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${p.type === 'facture' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                    {p.type === 'facture' ? '📄' : '📋'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                    <div className="flex items-center space-x-3 mt-0.5">
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{fmt(p.updatedAt)}</span></span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.status === 'terminé' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {p.status === 'terminé' ? '✓ Terminé' : '⏳ Brouillon'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {p.status === 'brouillon' && (
                    <button onClick={() => handleMarkComplete(p.id)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors" title="Marquer terminé">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleRestore(p)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1">
                    <RotateCcw className="w-3 h-3" /><span>Ouvrir</span>
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Aucun projet</p>
            <p className="text-xs text-slate-400 mt-1">Vos factures et quittances seront sauvegardées ici automatiquement.</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
        <p className="font-bold">💡 Sauvegarde automatique</p>
        <p className="text-[10px] text-blue-700">Votre facture en cours est automatiquement sauvegardée toutes les 30 secondes. Même après déconnexion, vous pouvez restaurer votre travail depuis "Restaurer dernière auto-sauvegarde".</p>
      </div>
    </div>
  );
};
