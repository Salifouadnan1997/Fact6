import React, { useMemo, useState } from 'react';
import { CV_TEMPLATES, type CVTemplate } from './cvTemplates';

export interface CVGeneratorProps {
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const CVGenerator: React.FC<CVGeneratorProps> = ({ onTriggerToast }) => {
  const templates = useMemo(() => CV_TEMPLATES as CVTemplate[], []);
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id ?? '');

  const selected = useMemo(
    () => templates.find(t => t.id === selectedId) ?? templates[0],
    [templates, selectedId]
  );

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-slate-900">Créateur de CV</h2>
      <p className="text-sm text-slate-500 mt-1">
        Mode démo : l’interface est restaurée pour que le build fonctionne. La génération IA sera ajoutée ensuite.
      </p>

      <div className="mt-4 flex flex-col gap-2 max-w-md">
        <label className="text-xs font-bold text-slate-700">Modèle</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700"
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>
              {t.preview} {t.name}
            </option>
          ))}
        </select>

        <div className="text-sm text-slate-700">
          Modèle sélectionné : <b>{selected?.name}</b>
        </div>

        <button
          onClick={() => onTriggerToast('Génération CV bientôt disponible ⚙️', 'info')}
          className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all"
        >
          Générer (démo)
        </button>
      </div>
    </div>
  );
};
