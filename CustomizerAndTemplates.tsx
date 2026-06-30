import React, { useState } from 'react';
import { 
  Palette, 
  Check, 
  Sparkles, 
  Eye, 
  Sliders, 
  Image as ImageIcon, 
  Type, 
  FileCheck, 
  PlusCircle, 
  ToggleLeft, 
  ToggleRight,
  ShieldCheck
} from 'lucide-react';
import { Template, TemplateCategory, Invoice } from './types';

interface CustomizerAndTemplatesProps {
  templates: Template[];
  currentInvoice: Invoice;
  onChangeInvoice: (inv: Invoice) => void;
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  onAddNewCustomTemplate: (tpl: Template) => void;
}

export const CustomizerAndTemplates: React.FC<CustomizerAndTemplatesProps> = ({
  templates,
  currentInvoice,
  onChangeInvoice,
  onTriggerToast,
  onAddNewCustomTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'Toutes'>('Toutes');
  const [customTemplateName, setCustomTemplateName] = useState('');

  const categories: (TemplateCategory | 'Toutes')[] = [
    'Toutes',
    'Moderne',
    'Minimaliste',
    'Supermarché',
    'Restaurant',
    'Boutique',
    'Pharmacie',
    'Poissonnerie',
    'Électronique',
    'Fashion',
    'Corporate',
    'Quittance Loyer',
    'Quittance Service',
    'Quittance Transport',
    'Quittance Éducation',
    'Quittance Santé',
  ];

  const filteredTemplates = selectedCategory === 'Toutes' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleApplyTemplate = (tpl: Template) => {
    onChangeInvoice({
      ...currentInvoice,
      templateId: tpl.id,
      paperSize: tpl.paperSize,
      primaryColor: tpl.primaryColor,
      fontFamily: tpl.fontFamily
    });
    onTriggerToast(`Template appliqué : ${tpl.name} (${tpl.paperSize})`, 'success');
  };

  const handleToggle = (field: 'showStamp' | 'showSignature' | 'showLogo' | 'showQrCode') => {
    onChangeInvoice({
      ...currentInvoice,
      [field]: !currentInvoice[field]
    });
    onTriggerToast('Mise en page mise à jour', 'info');
  };

  const handleSaveCustomTemplate = () => {
    if (!customTemplateName) {
      onTriggerToast('Veuillez donner un nom à votre template personnalisé', 'warning');
      return;
    }
    const newTpl: Template = {
      id: `tpl-custom-${Date.now()}`,
      name: customTemplateName,
      category: selectedCategory === 'Toutes' ? 'Moderne' : selectedCategory,
      styleDescription: 'Modèle personnalisé créé par l\'utilisateur',
      paperSize: currentInvoice.paperSize,
      primaryColor: currentInvoice.primaryColor,
      fontFamily: currentInvoice.fontFamily,
      isCustom: true
    };
    onAddNewCustomTemplate(newTpl);
    setCustomTemplateName('');
    onTriggerToast(`Nouveau template enregistré : ${newTpl.name}`, 'success');
  };

  const colors = [
    { label: 'Bleu Pro', value: '#2563eb' },
    { label: 'Émeraude Caisse', value: '#059669' },
    { label: 'Rouge Bistrot', value: '#b91c1c' },
    { label: 'Rose Boutique', value: '#db2777' },
    { label: 'Indigo Tech', value: '#4f46e5' },
    { label: 'Sombre Minimal', value: '#18181b' },
    { label: 'Violet Couture', value: '#9333ea' },
    { label: 'Cyan Océan', value: '#0284c7' },
  ];

  const fonts = [
    { label: 'Sans-Serif (Moderne & Lisible)', value: 'font-sans' },
    { label: 'Monospace (Ticket Caisse / Chiffres nets)', value: 'font-mono' },
    { label: 'Serif (Élégant & Traditionnel)', value: 'font-serif' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Palette className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Personnalisation & Galerie de 50 Templates</h1>
          </div>
          <p className="text-xs text-slate-500">
            Explorez 30 modèles professionnels prêts à l'emploi ou personnalisez entièrement l'apparence de vos factures normalisées.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-slate-700">50 Templates Disponibles</span>
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md font-mono text-[10px]">IA Optimisé</span>
        </div>
      </div>

      {/* Main Grid: Customizer Controls (Left 4 cols) & Template Gallery (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Advanced Customizer (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Personnalisation Avancée</h3>
            </div>

            {/* Couleurs Principales */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Couleur d'En-tête & Totaux</label>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {colors.map(c => (
                  <button
                    key={c.value}
                    onClick={() => {
                      onChangeInvoice({ ...currentInvoice, primaryColor: c.value });
                      onTriggerToast(`Couleur changée : ${c.label}`, 'info');
                    }}
                    className={`h-8 rounded-lg flex items-center justify-center border transition-all ${
                      currentInvoice.primaryColor === c.value ? 'ring-2 ring-slate-900 ring-offset-2 border-transparent shadow-md' : 'border-slate-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {currentInvoice.primaryColor === c.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Polices */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Police de Caractères</label>
              <div className="space-y-2 pt-1">
                {fonts.map(f => (
                  <button
                    key={f.value}
                    onClick={() => {
                      onChangeInvoice({ ...currentInvoice, fontFamily: f.value });
                      onTriggerToast('Police mise à jour', 'info');
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      currentInvoice.fontFamily === f.value ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={f.value}>{f.label}</span>
                    {currentInvoice.fontFamily === f.value && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Elements Toggles */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Éléments Visuels & Légaux</label>
              
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">Logo de l'entreprise</span>
                </div>
                <button onClick={() => handleToggle('showLogo')} className="text-blue-600 focus:outline-none">
                  {currentInvoice.showLogo ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">Cachet (via Cachets & Signatures)</span>
                </div>
                <span className={`text-xs font-bold ${currentInvoice.stampImageUrl ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {currentInvoice.stampImageUrl ? '✓ Configuré' : 'Non configuré'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">Signature (via Cachets & Signatures)</span>
                </div>
                <span className={`text-xs font-bold ${currentInvoice.signatureImageUrl ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {currentInvoice.signatureImageUrl ? '✓ Configurée' : 'Non configurée'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">QR Code de Sécurité</span>
                </div>
                <button onClick={() => handleToggle('showQrCode')} className="text-blue-600 focus:outline-none">
                  {currentInvoice.showQrCode ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Slogan & Remerciements */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Slogan Commercial</label>
                <input 
                  type="text" 
                  value={currentInvoice.slogan}
                  onChange={(e) => onChangeInvoice({ ...currentInvoice, slogan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Message de Remerciement</label>
                <textarea 
                  rows={2}
                  value={currentInvoice.thankYouMessage}
                  onChange={(e) => onChangeInvoice({ ...currentInvoice, thankYouMessage: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                />
              </div>
            </div>

            {/* Save Custom Template */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Enregistrer comme Template</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={customTemplateName}
                  onChange={(e) => setCustomTemplateName(e.target.value)}
                  placeholder="Nom du modèle..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <button
                  type="button"
                  onClick={handleSaveCustomTemplate}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Créer</span>
                </button>
              </div>
            </div>

          </div>
        </div>


        {/* Right Gallery: 50 Templates Showcase */}
        <div className="lg:col-span-8 space-y-6">
          {/* Category Filter Tabs */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((tpl) => {
              const isSelected = currentInvoice.templateId === tpl.id;
              return (
                <div 
                  key={tpl.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group ${
                    isSelected ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2 shadow-lg' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mr-1.5">
                        {tpl.category}
                      </span>
                      {tpl.isCustom && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          Perso
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {tpl.paperSize}
                    </span>
                  </div>

                  {/* Card Body: Mock Visual Preview */}
                  <div className="p-6 flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-slate-50/50 min-h-[140px] text-center relative">
                    <span className="text-2xl mb-2">{
                      tpl.category === 'Quittance Loyer' ? '🏠' :
                      tpl.category === 'Quittance Service' ? '🔧' :
                      tpl.category === 'Quittance Transport' ? '🚚' :
                      tpl.category === 'Quittance Éducation' ? '📚' :
                      tpl.category === 'Quittance Santé' ? '🏥' :
                      tpl.category === 'Restaurant' ? '🍽️' :
                      tpl.category === 'Supermarché' ? '🛒' :
                      tpl.category === 'Pharmacie' ? '💊' :
                      tpl.category === 'Fashion' ? '👗' :
                      tpl.category === 'Poissonnerie' ? '🐟' :
                      tpl.category === 'Électronique' ? '💻' :
                      tpl.category === 'Corporate' ? '🏢' :
                      tpl.category === 'Boutique' ? '🛍️' : ''
                    }</span>
                    <div className="w-12 h-1.5 rounded-full mb-3" style={{ backgroundColor: tpl.primaryColor }}></div>
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">{tpl.name}</h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-[220px] leading-relaxed line-clamp-2">
                      {tpl.styleDescription}
                    </p>

                    {/* Badge selection */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Action Button */}
                  <div className="p-4 border-t border-slate-100 bg-white">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        isSelected 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' 
                          : 'bg-slate-900 hover:bg-blue-600 text-white shadow-sm'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isSelected ? 'Modèle Actif' : 'Appliquer ce Modèle'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Palette className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">Aucun template trouvé dans cette catégorie</h3>
              <p className="text-xs text-slate-500">Sélectionnez "Toutes" ou créez un template personnalisé dans le panneau de gauche.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
