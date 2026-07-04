import { useSubscriptionGuard } from "./useSubscriptionGuard";
import { supabase } from './src/config/supabaseClient';
import React, { useState } from 'react';
import { 
  Receipt, 
  Sparkles, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  FileText, 
  UserCheck, 
  Wand2, 
  QrCode,
  ImagePlus,
  X,
  Upload
} from 'lucide-react';
import { Invoice, DocumentType, Product, Client, Template } from './types';
import { exportPDF, printInvoice } from './exportUtils';

// Background removal — contrast-based, works on any paper color
function removeBg(imgSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      const px = d.data;
      const w = c.width, h = c.height;

      // Detect bg from 10% border
      const s = Math.max(5, Math.floor(Math.min(w, h) * 0.1));
      let bR = 0, bG = 0, bB = 0, n = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (x < s || x >= w - s || y < s || y >= h - s) {
          const i = (y * w + x) * 4; bR += px[i]; bG += px[i+1]; bB += px[i+2]; n++;
        }
      }
      bR = Math.round(bR / n); bG = Math.round(bG / n); bB = Math.round(bB / n);

      // For each pixel: compute euclidean distance to bg color
      for (let i = 0; i < px.length; i += 4) {
        const dr = px[i] - bR, dg = px[i+1] - bG, db = px[i+2] - bB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        
        // dist < 30: pure background → transparent
        // dist 30-60: transition → partial alpha
        // dist > 60: ink/content → fully opaque
        if (dist < 30) {
          px[i+3] = 0;
        } else if (dist < 60) {
          px[i+3] = Math.round(((dist - 30) / 30) * 255);
        }
        // else: keep fully opaque
      }

      ctx.putImageData(d, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imgSrc);
    img.src = imgSrc;
  });
}

// Colorize an image (tint transparent PNG with a color)
function colorizeImage(imgSrc: string, color: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      // Parse hex color
      const r = parseInt(color.slice(1,3), 16);
      const g = parseInt(color.slice(3,5), 16);
      const b = parseInt(color.slice(5,7), 16);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      const px = d.data;
      for (let i = 0; i < px.length; i += 4) {
        if (px[i+3] > 20) { // Only colorize non-transparent pixels
          px[i] = r;
          px[i+1] = g;
          px[i+2] = b;
          // Keep original alpha
        }
      }
      ctx.putImageData(d, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imgSrc);
    img.src = imgSrc;
  });
}

interface InvoiceGeneratorProps {
  onNavigateToTab?: (tab: string) => void;
  currentInvoice: Invoice;
  onChangeInvoice: (inv: Invoice) => void;
  products: Product[];
  clients: Client[];
  templates: Template[];
    userId: string;
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  onNavigateToTab: (tab: string) => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  currentInvoice,
  onChangeInvoice,
  products,
    userId,
  onTriggerToast,
  onNavigateToTab
  
}) => {
  const { checkAndProceed } = useSubscriptionGuard();

  const [itemName, setItemName] = useState<string>('');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemWeight, setItemWeight] = useState<string>('');
  const [itemColor, setItemColor] = useState<string>('');
  const [aiAnalysisTip, setAiAnalysisTip] = useState<string>('');
  const [showSupplierSetup, setShowSupplierSetup] = useState<boolean>(false);
  const [dragging, setDragging] = useState<'stamp' | 'signature' | null>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);

  const handleDragStart = (type: 'stamp' | 'signature') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDragging(type);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    if (dragging === 'stamp') {
      onChangeInvoice({ ...currentInvoice, stampPos: { x, y } });
    } else {
      onChangeInvoice({ ...currentInvoice, signaturePos: { x, y } });
    }
  };


  const handleDragEnd = () => setDragging(null);

  // Load saved supplier profile on mount
  const [supplierLoaded, setSupplierLoaded] = useState(false);
  if (!supplierLoaded) {
    try {
      const saved = localStorage.getItem('factureset_supplier');
      if (saved) {
        const sp = JSON.parse(saved);
        if (sp.companyName && currentInvoice.companyName !== sp.companyName) {
          onChangeInvoice({ ...currentInvoice, companyName: sp.companyName, rccm: sp.rccm || currentInvoice.rccm, ifu: sp.ifu || currentInvoice.ifu, address: sp.address || currentInvoice.address, phone: sp.phone || currentInvoice.phone, slogan: sp.slogan || currentInvoice.slogan, logoUrl: sp.logoUrl || currentInvoice.logoUrl });
        }
      }
    } catch {}
    setSupplierLoaded(true);
  }

  const documentTypes: DocumentType[] = [
    'Facture normalisée',
    'Ticket thermique',
    'Facture PDF',
    'Facture A4',
    'Facture proforma',
    'Reçu de paiement',
    'Bon de commande'
  ];

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
  };

  const updateField = (field: keyof Invoice, value: any) => {
    const updated = { ...currentInvoice, [field]: value };
    // Recalculate totals
    if (['items', 'vatRate', 'discountRate', 'amountPaid'].includes(field)) {
      const subtotal = updated.items.reduce((sum, item) => sum + item.total, 0);
      const discountAmount = (subtotal * updated.discountRate) / 100;
      const taxableAmount = subtotal - discountAmount;
      const vatAmount = (taxableAmount * updated.vatRate) / 100;
      const totalAmount = taxableAmount + vatAmount;
      const reliquat = updated.amountPaid - totalAmount;

      updated.subtotal = subtotal;
      updated.discountAmount = discountAmount;
      updated.vatAmount = vatAmount;
      updated.totalAmount = totalAmount;
      updated.reliquat = reliquat;
    }
    onChangeInvoice(updated);
  };

  const handleAddItem = () => {
    if (!itemName.trim()) {
      onTriggerToast('Veuillez entrer le nom du produit', 'warning');
      return;
    }
    if (itemPrice <= 0) {
      onTriggerToast('Veuillez entrer un prix valide', 'warning');
      return;
    }

    const newItem = {
      id: `item-${Date.now()}`,
      productId: `manual-${Date.now()}`,
      name: itemName.trim(),
      quantity: itemQty,
      unitPrice: itemPrice,
      total: itemPrice * itemQty,
      weight: itemWeight || undefined,
      color: itemColor || undefined
    };

    const updatedItems = [...currentInvoice.items, newItem];
    updateField('items', updatedItems);
    setItemName('');
    setItemPrice(0);
    setItemQty(1);
    setItemWeight('');
    setItemColor('');
    onTriggerToast(`Produit ajouté : ${newItem.name}`, 'success');
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = currentInvoice.items.filter(i => i.id !== itemId);
    updateField('items', updatedItems);
    onTriggerToast('Produit retiré', 'info');
  };

  const handleItemImageUpload = (itemId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const updatedItems = currentInvoice.items.map(i => 
        i.id === itemId ? { ...i, imageUrl: dataUrl } : i
      );
      updateField('items', updatedItems);
      onTriggerToast('Image produit ajoutée !', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveItemImage = (itemId: string) => {
    const updatedItems = currentInvoice.items.map(i => 
      i.id === itemId ? { ...i, imageUrl: undefined } : i
    );
    updateField('items', updatedItems);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChangeInvoice({ ...currentInvoice, logoUrl: event.target?.result as string });
        onTriggerToast('Logo de l\'entreprise mis à jour !', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Magic Fill Triggers
  const handleAIMagicFill = (type: 'supermarket' | 'restaurant' | 'tech' | 'b2b') => {
    let newItems: any[] = [];
    let clientName = 'Client Comptoir';
    let clientPhone = '';
    let clientIfu = '';
    let docType: DocumentType = 'Facture normalisée';
    let paperSize: '58mm' | '80mm' | 'A4' = '80mm';

    if (type === 'supermarket') {
      const p1 = products.find(p => p.id === 'prod-1') || products[0];
      const p2 = products.find(p => p.id === 'prod-2') || products[1];
      newItems = [
        { id: 'm1', productId: p1.id, name: p1.name, quantity: 3, unitPrice: p1.price, total: p1.price * 3, description: 'Promotion lot de 3' },
        { id: 'm2', productId: p2.id, name: p2.name, quantity: 2, unitPrice: p2.price, total: p2.price * 2, description: 'Huile végétale raffinée' }
      ];
      clientName = 'Supermarché Le Panier';
      clientPhone = '+225 05 99 88 77';
      clientIfu = 'CI-2019-0012934';
      docType = 'Ticket thermique';
      paperSize = '80mm';
      setAiAnalysisTip("IA: Remplissage automatique 'Supermarché' appliqué. Marge moyenne calculée à 22%.");
    } else if (type === 'restaurant') {
      const p4 = products.find(p => p.id === 'prod-4') || products[3];
      const p5 = products.find(p => p.id === 'prod-5') || products[4];
      newItems = [
        { id: 'm3', productId: p4.id, name: p4.name, quantity: 4, unitPrice: p4.price, total: p4.price * 4, description: 'Table 14 - Service midi' },
        { id: 'm4', productId: p5.id, name: p5.name, quantity: 4, unitPrice: p5.price, total: p5.price * 4, description: 'Boisson fraîche nature' }
      ];
      clientName = 'Table 14 (Client Anonyme)';
      clientPhone = 'Non spécifié';
      docType = 'Ticket thermique';
      paperSize = '58mm';
      setAiAnalysisTip("IA: Ticket de caisse 'Restaurant' généré. Suggestions de pourboire intégrées.");
    } else if (type === 'tech') {
      const p8 = products.find(p => p.id === 'prod-8') || products[7];
      const p9 = products.find(p => p.id === 'prod-9') || products[8];
      newItems = [
        { id: 'm5', productId: p8.id, name: p8.name, quantity: 1, unitPrice: p8.price, total: p8.price * 1, description: 'IMEI: 358920391029384 - Garantie 2 ans' },
        { id: 'm6', productId: p9.id, name: p9.name, quantity: 1, unitPrice: p9.price, total: p9.price * 1, description: 'Numéro de série: SN-90812' }
      ];
      clientName = 'Hôtel Ivoire & Suite';
      clientPhone = '+225 07 11 22 33';
      clientIfu = 'CI-2021-0092839';
      docType = 'Facture normalisée';
      paperSize = 'A4';
      setAiAnalysisTip("IA: Facture Tech B2B avec numéros de série et garanties complétée.");
    }

    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const vatRate = 18;
    const vatAmount = (subtotal * vatRate) / 100;
    const totalAmount = subtotal + vatAmount;
    const amountPaid = totalAmount;

    onChangeInvoice({
      ...currentInvoice,
      documentType: docType,
      paperSize,
      clientName,
      clientPhone,
      clientIfu,
      items: newItems,
      subtotal,
      vatRate,
      vatAmount,
      discountRate: 0,
      discountAmount: 0,
      totalAmount,
      amountPaid,
      reliquat: 0
    });
    onTriggerToast('IA Génération automatique réussie', 'success');
  };



  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Générateur de Factures Normalisées</h1>
          </div>
          <p className="text-xs text-slate-500">
            Créez instantanément des tickets thermiques et factures A4 conformes aux normes DGI avec assistance IA.
          </p>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1 mr-2">
            <Wand2 className="w-3.5 h-3.5 text-blue-500" />
            <span>IA Magic Fill :</span>
          </span>
          <button 
            onClick={() => handleAIMagicFill('supermarket')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 transition-colors whitespace-nowrap"
          >
            🛒 Supermarché
          </button>
          <button 
            onClick={() => handleAIMagicFill('restaurant')}
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-200 transition-colors whitespace-nowrap"
          >
            🍽️ Restaurant
          </button>
          <button 
            onClick={() => handleAIMagicFill('tech')}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-200 transition-colors whitespace-nowrap"
          >
            💻 Électronique B2B
          </button>
        </div>
      </div>

      {aiAnalysisTip && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start space-x-3 text-blue-900 text-xs animate-fadeIn">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{aiAnalysisTip}</p>
          </div>
          <button onClick={() => setAiAnalysisTip('')} className="text-blue-400 hover:text-blue-600 font-bold">&times;</button>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Config & Items (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Type de document & Format */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Paramètres du Document</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Type de Document</label>
                <select 
                  value={currentInvoice.documentType}
                  onChange={(e) => updateField('documentType', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {documentTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Format Papier</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(['58mm', '80mm', 'A4'] as const).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateField('paperSize', size)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        currentInvoice.paperSize === size 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">N° Facture</label>
                <input 
                  type="text" 
                  value={currentInvoice.invoiceNumber}
                  onChange={(e) => updateField('invoiceNumber', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date & Heure</label>
                <input 
                  type="text" 
                  value={currentInvoice.dateTime}
                  onChange={(e) => updateField('dateTime', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vendeur / Caisse</label>
                <input 
                  type="text" 
                  value={currentInvoice.sellerName}
                  onChange={(e) => updateField('sellerName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 1b: Informations de l'Entreprise Émettrice */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Informations Entreprise Émettrice</span>
              </h3>
              <button type="button" onClick={() => setShowSupplierSetup(!showSupplierSetup)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors">
                {showSupplierSetup ? 'Fermer' : '⚙️ Pré-remplir mes infos'}
              </button>
            </div>

            {/* Supplier Profile Save */}
            {showSupplierSetup && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3 animate-fadeIn">
                <p className="text-xs text-emerald-800 font-bold">💡 Enregistrez vos informations pour pré-remplir automatiquement chaque nouvelle facture.</p>
                <button type="button" onClick={() => {
                  const profile = {
                    companyName: currentInvoice.companyName,
                    rccm: currentInvoice.rccm,
                    ifu: currentInvoice.ifu,
                    address: currentInvoice.address,
                    phone: currentInvoice.phone,
                    slogan: currentInvoice.slogan,
                    logoUrl: currentInvoice.logoUrl,
                  };
                  localStorage.setItem('factureset_supplier', JSON.stringify(profile));
                  onTriggerToast('Profil fournisseur enregistré ! Ces infos seront appliquées automatiquement.', 'success');
                  setShowSupplierSetup(false);
                }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all">
                  ✅ Enregistrer comme profil par défaut
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nom de l'Entreprise</label>
                <input 
                  type="text" 
                  value={currentInvoice.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Raison sociale"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Téléphone</label>
                <input 
                  type="text" 
                  value={currentInvoice.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+225 ..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Adresse de l'Entreprise</label>
              <input 
                type="text" 
                value={currentInvoice.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Boulevard, Ville, Pays"
              />
            </div>

            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Logo / Bannière Entreprise</label>
                <div className="flex items-center space-x-3">
                  {currentInvoice.logoUrl && (
                    <img src={currentInvoice.logoUrl} alt="Logo" className="h-10 w-auto object-contain border border-slate-200 rounded p-1" />
                  )}
                  <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2">
                    <ImagePlus className="w-4 h-4" />
                    <span>Changer le logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  RCCM <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={currentInvoice.rccm}
                  onChange={(e) => updateField('rccm', e.target.value)}
                  className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CI-ABJ-XX-XXXX-BXX-XXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  IFU <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={currentInvoice.ifu}
                  onChange={(e) => updateField('ifu', e.target.value)}
                  className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="001234567890A"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Informations Client */}
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4 border-l-4 border-l-blue-500">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Informations du Client</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nom du Client</label>
                <input 
                  type="text" 
                  value={currentInvoice.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Téléphone Client</label>
                <input 
                  type="text" 
                  value={currentInvoice.clientPhone || ''}
                  onChange={(e) => updateField('clientPhone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+229 ..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Ajout & Liste des Produits */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Produits & Lignes de Facturation</span>
            </h3>

            {/* Add Item Toolbar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nom du produit</label>
                  <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Ex: Riz Parfumé 25kg"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prix Unitaire</label>
                  <input type="number" min="0" value={itemPrice || ''} onChange={(e) => setItemPrice(Number(e.target.value) || 0)} placeholder="0 FCFA"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quantité</label>
                  <input type="number" min="1" value={itemQty} onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Poids</label>
                  <input type="text" value={itemWeight} onChange={(e) => setItemWeight(e.target.value)} placeholder="ex: 25kg"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Couleur</label>
                  <input type="text" value={itemColor} onChange={(e) => setItemColor(e.target.value)} placeholder="ex: Noir"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button type="button" onClick={handleAddItem}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-1.5">
                <Plus className="w-4 h-4" /><span>Ajouter le produit à la facture</span>
              </button>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-2">Produit</th>
                    <th className="py-2.5 px-2 text-center">Qté</th>
                    <th className="py-2.5 px-2 text-center">Poids</th>
                    <th className="py-2.5 px-2 text-center">Couleur</th>
                    <th className="py-2.5 px-2 text-right">P.U</th>
                    <th className="py-2.5 px-2 text-right">Total</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {currentInvoice.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        Aucun produit ajouté.
                      </td>
                    </tr>
                  ) : (
                    currentInvoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2">
                          <div className="flex items-center space-x-2">
                            {item.imageUrl ? (
                              <div className="relative shrink-0">
                                <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                                <button type="button" onClick={() => handleRemoveItemImage(item.id)}
                                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-rose-600">
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            ) : (
                              <label className="shrink-0 w-9 h-9 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                                <ImagePlus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                                <input type="file" accept="image/*" className="hidden"
                                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleItemImageUpload(item.id, f); }} />
                              </label>
                            )}
                            <span className="font-bold text-slate-900 truncate max-w-[140px]">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-700">{item.quantity}</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 text-[11px]">{item.weight || '—'}</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 text-[11px]">{item.color || '—'}</td>
                        <td className="py-2.5 px-2 text-right font-medium text-slate-700">{formatFCFA(item.unitPrice)}</td>
                        <td className="py-2.5 px-2 text-right font-extrabold text-blue-600">{formatFCFA(item.total)}</td>
                        <td className="py-2.5 px-2 text-center">
                          <button type="button" onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors">
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals & Calculations */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Sous-total brut :</span>
                <span>{formatFCFA(currentInvoice.subtotal)}</span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-600 font-medium">Remise commerciale (%) :</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={currentInvoice.discountRate} 
                    onChange={(e) => updateField('discountRate', parseFloat(e.target.value) || 0)}
                    className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-center" 
                  />
                </div>
                <span className="text-xs text-rose-600 font-semibold">- {formatFCFA(currentInvoice.discountAmount)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-600 font-medium">Taux TVA (%) :</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="50" 
                    value={currentInvoice.vatRate} 
                    onChange={(e) => updateField('vatRate', parseFloat(e.target.value) || 0)}
                    className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-center" 
                  />
                </div>
                <span className="text-xs text-slate-700 font-semibold">+ {formatFCFA(currentInvoice.vatAmount)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Montant Total TTC :</span>
                <span className="text-xl font-extrabold text-blue-600">{formatFCFA(currentInvoice.totalAmount)}</span>
              </div>

              {/* Amount Paid & Reliquat */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Montant Payé par le Client</label>
                  <input 
                    type="number" 
                    value={currentInvoice.amountPaid}
                    onChange={(e) => updateField('amountPaid', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reliquat (Monnaie à rendre)</label>
                  <div className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold flex items-center justify-between border ${
                    currentInvoice.reliquat >= 0 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    <span>{currentInvoice.reliquat >= 0 ? 'À rendre :' : 'Reste à payer :'}</span>
                    <span>{formatFCFA(Math.abs(currentInvoice.reliquat))}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Mode de paiement :</span>
                <select 
                  value={currentInvoice.paymentMethod} 
                  onChange={(e) => updateField('paymentMethod', e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
                >
                  <option value="Espèces">Espèces</option>
                  <option value="Carte Bancaire">Carte Bancaire</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Virement">Virement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Cachet & Signature rapide */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Cachet & Signature</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cachet */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Cachet / Tampon</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={currentInvoice.showStamp} onChange={() => onChangeInvoice({ ...currentInvoice, showStamp: !currentInvoice.showStamp })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-300 peer-checked:bg-blue-600 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
                {currentInvoice.stampImageUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <img src={currentInvoice.stampImageUrl} alt="Cachet" className="w-16 h-16 object-contain bg-white rounded-lg border border-slate-200 p-1" />
                      <button onClick={() => onChangeInvoice({ ...currentInvoice, stampImageUrl: undefined })}
                        className="text-[10px] text-rose-500 hover:underline font-bold">Supprimer</button>
                    </div>
                    {/* Color tint for stamp */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Couleur :</span>
                      <div className="flex space-x-1.5 mt-1">
                        {['#dc2626','#1e40af','#059669','#7c3aed','#d97706','#0f172a','#be185d','#0284c7'].map(c => (
                          <button key={c} onClick={async () => {
                            onTriggerToast('Application de la couleur...', 'info');
                            const tinted = await colorizeImage(currentInvoice.stampImageUrl!, c);
                            onChangeInvoice({ ...currentInvoice, stampImageUrl: tinted, stampColor: c });
                            onTriggerToast('Couleur appliquée !', 'success');
                          }}
                          className="w-5 h-5 rounded-full border border-slate-300 hover:scale-125 transition-transform" style={{ backgroundColor: c }}></button>
                        ))}
                      </div>
                    </div>
                    {/* Size slider */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Taille :</span>
                        <span className="text-[10px] text-slate-400">{Math.round((currentInvoice.stampScale || 1) * 100)}%</span>
                      </div>
                      <input type="range" min="30" max="250" value={(currentInvoice.stampScale || 1) * 100}
                        onChange={(e) => onChangeInvoice({ ...currentInvoice, stampScale: parseInt(e.target.value) / 100 })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1 accent-blue-600" />
                    </div>
                    {/* Rotation slider */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Rotation :</span>
                        <span className="text-[10px] text-slate-400">{currentInvoice.stampRotation || 0}°</span>
                      </div>
                      <input type="range" min="-180" max="180" value={currentInvoice.stampRotation || 0}
                        onChange={(e) => onChangeInvoice({ ...currentInvoice, stampRotation: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1 accent-blue-600" />
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">Aucun cachet configuré.</p>
                )}
                <label className="w-full bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-bold py-2 rounded-lg border border-slate-200 flex items-center justify-center space-x-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /><span>Importer un tampon</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    onTriggerToast('Suppression arrière-plan...', 'info');
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                      const src = ev.target?.result as string;
                      const cleaned = await removeBg(src);
                      onChangeInvoice({ ...currentInvoice, stampImageUrl: cleaned, showStamp: true });
                      onTriggerToast('Tampon importé (arrière-plan supprimé) !', 'success');
                    };
                    reader.readAsDataURL(file);
                  }} />
                </label>
              </div>

              {/* Signature */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Signature</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={currentInvoice.showSignature} onChange={() => onChangeInvoice({ ...currentInvoice, showSignature: !currentInvoice.showSignature })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-300 peer-checked:bg-blue-600 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
                {currentInvoice.signatureImageUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <img src={currentInvoice.signatureImageUrl} alt="Signature" className="w-20 h-12 object-contain bg-white rounded-lg border border-slate-200 p-1" />
                      <button onClick={() => onChangeInvoice({ ...currentInvoice, signatureImageUrl: undefined })}
                        className="text-[10px] text-rose-500 hover:underline font-bold">Supprimer</button>
                    </div>
                    {/* Color tint for signature */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Couleur :</span>
                      <div className="flex space-x-1.5 mt-1">
                        {['#1e293b','#1e40af','#dc2626','#059669','#7c3aed','#d97706','#0f172a','#be185d'].map(c => (
                          <button key={c} onClick={async () => {
                            onTriggerToast('Application de la couleur...', 'info');
                            const tinted = await colorizeImage(currentInvoice.signatureImageUrl!, c);
                            onChangeInvoice({ ...currentInvoice, signatureImageUrl: tinted });
                            onTriggerToast('Couleur appliquée !', 'success');
                          }}
                          className="w-5 h-5 rounded-full border border-slate-300 hover:scale-125 transition-transform" style={{ backgroundColor: c }}></button>
                        ))}
                      </div>
                    </div>
                    {/* Size slider */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Taille :</span>
                        <span className="text-[10px] text-slate-400">{Math.round((currentInvoice.signatureScale || 1) * 100)}%</span>
                      </div>
                      <input type="range" min="30" max="250" value={(currentInvoice.signatureScale || 1) * 100}
                        onChange={(e) => onChangeInvoice({ ...currentInvoice, signatureScale: parseInt(e.target.value) / 100 })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1 accent-blue-600" />
                    </div>
                    {/* Rotation slider */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Rotation :</span>
                        <span className="text-[10px] text-slate-400">{currentInvoice.signatureRotation || 0}°</span>
                      </div>
                      <input type="range" min="-180" max="180" value={currentInvoice.signatureRotation || 0}
                        onChange={(e) => onChangeInvoice({ ...currentInvoice, signatureRotation: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1 accent-blue-600" />
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">Aucune signature configurée.</p>
                )}
                <label className="w-full bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-bold py-2 rounded-lg border border-slate-200 flex items-center justify-center space-x-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /><span>Importer une signature</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    onTriggerToast('Suppression arrière-plan...', 'info');
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                      const src = ev.target?.result as string;
                      const cleaned = await removeBg(src);
                      onChangeInvoice({ ...currentInvoice, signatureImageUrl: cleaned, showSignature: true });
                      onTriggerToast('Signature importée (arrière-plan supprimé) !', 'success');
                    };
                    reader.readAsDataURL(file);
                  }} />
                </label>
              </div>
            </div>
          </div>
        </div>


        {/* Right Preview Pane: Thermal Ticket / A4 Simulation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl sticky top-20">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-extrabold tracking-tight">Aperçu Impression Directe</h3>
              </div>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {currentInvoice.paperSize} ({currentInvoice.paperSize === '58mm' ? 'Ticket de Caisse' : currentInvoice.paperSize === '80mm' ? 'Ticket Standard' : 'Format A4'})
              </span>
            </div>

            {/* Live Thermal Ticket / A4 Container */}
            <div className="flex justify-center bg-slate-950 p-6 rounded-xl border border-slate-800/80 overflow-x-auto shadow-inner">
              <div 
                ref={previewRef}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                className={`bg-white text-slate-900 p-6 rounded shadow-lg transition-all font-mono select-none relative ${
                  currentInvoice.paperSize === '58mm' ? 'w-[280px] text-[10px]' :
                  currentInvoice.paperSize === '80mm' ? 'w-[360px] text-xs' : 'w-[480px] text-xs'
                } ${dragging ? 'cursor-grabbing' : ''}`}
                style={{ fontFamily: currentInvoice.fontFamily === 'font-mono' ? 'monospace' : currentInvoice.fontFamily === 'font-serif' ? 'serif' : 'sans-serif' }}
              >
                {/* Background Watermark/Logo toggle */}
                {currentInvoice.showLogo && currentInvoice.logoUrl && (
                  <div className="flex justify-center mb-3">
                    <img src={currentInvoice.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                  </div>
                )}

                {/* En-tête Société — couleur du template */}
                <div className="text-center space-y-0.5 pb-3 mb-3" style={{ borderBottom: `2px solid ${currentInvoice.primaryColor}` }}>
                  <h2 className="font-extrabold text-sm tracking-wide" style={{ color: currentInvoice.primaryColor }}>{currentInvoice.companyName}</h2>
                  {currentInvoice.slogan && <p className="text-[10px] italic text-slate-600">{currentInvoice.slogan}</p>}
                  <p className="text-[10px] text-slate-600">{currentInvoice.address}</p>
                  <p className="text-[10px] text-slate-600">Tél: {currentInvoice.phone}</p>
                  <div className="pt-1 text-[9px] text-slate-500 space-y-0.5">
                    <p>RCCM: {currentInvoice.rccm}</p>
                    <p>IFU: {currentInvoice.ifu}</p>
                  </div>
                </div>

                {/* Informations Facture */}
                <div className="space-y-1 border-b border-dashed border-slate-300 pb-3 mb-3 text-[10px]">
                  <div className="flex justify-between">
                    <span className="font-bold" style={{ color: currentInvoice.primaryColor }}>{currentInvoice.documentType.toUpperCase()} :</span>
                    <span className="font-mono font-bold">{currentInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE :</span>
                    <span>{currentInvoice.dateTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CAISSIER :</span>
                    <span>{currentInvoice.sellerName}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 mt-1">
                    <span className="font-bold">CLIENT :</span>
                    <span className="font-bold text-right truncate max-w-[180px]">{currentInvoice.clientName}</span>
                  </div>
                  {currentInvoice.clientIfu && currentInvoice.clientIfu !== 'Non spécifié' && (
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>IFU Client :</span>
                      <span>{currentInvoice.clientIfu}</span>
                    </div>
                  )}
                  {currentInvoice.clientRccm && (
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>RCCM Client :</span>
                      <span>{currentInvoice.clientRccm}</span>
                    </div>
                  )}
                </div>

                {/* Tableau des Produits */}
                <div className="border-b border-dashed border-slate-300 pb-3 mb-3">
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-1 mb-2 text-[10px]">
                    <span className="flex-1">Désignation</span>
                    <span className="w-8 text-center">Qté</span>
                    <span className="w-16 text-right">Total</span>
                  </div>
                  <div className="space-y-1.5">
                    {currentInvoice.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-[10px] leading-tight">
                        <div className="flex-1 pr-1 flex items-start space-x-1.5">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt="" className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-bold text-slate-800">{item.name}</p>
                            <p className="text-[9px] text-slate-500">{item.quantity} x {formatFCFA(item.unitPrice)}</p>
                          </div>
                        </div>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <span className="w-16 text-right font-extrabold text-slate-900">{formatFCFA(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totaux */}
                <div className="space-y-1 border-b border-dashed border-slate-300 pb-3 mb-3 text-[10px]">
                  <div className="flex justify-between text-slate-600">
                    <span>SOUS-TOTAL :</span>
                    <span>{formatFCFA(currentInvoice.subtotal)}</span>
                  </div>
                  {currentInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>REMISE ({currentInvoice.discountRate}%) :</span>
                      <span>- {formatFCFA(currentInvoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>TVA ({currentInvoice.vatRate}%) :</span>
                    <span>+ {formatFCFA(currentInvoice.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-extrabold pt-2 mt-1" style={{ borderTop: `2px solid ${currentInvoice.primaryColor}`, color: currentInvoice.primaryColor }}>
                    <span>TOTAL TTC :</span>
                    <span className="text-sm">{formatFCFA(currentInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-700 pt-1">
                    <span>MONTANT PAYÉ ({currentInvoice.paymentMethod}) :</span>
                    <span className="font-bold">{formatFCFA(currentInvoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-900 bg-slate-100 p-1 rounded mt-1">
                    <span>{currentInvoice.reliquat >= 0 ? 'MONNAIE RENDUE :' : 'RESTE À PAYER :'}</span>
                    <span>{formatFCFA(Math.abs(currentInvoice.reliquat))}</span>
                  </div>
                </div>

                {/* Draggable Stamp & Signature overlays removed from flow — see absolute overlays below */}

                {/* Message de remerciement & QR Code */}
                <div className="text-center space-y-3 pt-1">
                  <p className="text-[10px] font-bold text-slate-800 italic">{currentInvoice.thankYouMessage}</p>
                  
                  {currentInvoice.showQrCode && (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="p-1.5 bg-white border border-slate-300 rounded inline-block shadow-sm">
                        <QrCode className="w-16 h-16 text-slate-900" />
                      </div>
                      <span className="text-[8px] text-slate-400 font-mono">Scan de vérification DGI</span>
                    </div>
                  )}

                  <p className="text-[8px] text-slate-400 leading-tight pt-2 border-t border-slate-100">
                    {currentInvoice.legalMention}
                  </p>
                </div>

                {/* ═══ Draggable Stamp Overlay ═══ */}
                {currentInvoice.showStamp && currentInvoice.stampImageUrl && (
                  <img 
                    src={currentInvoice.stampImageUrl} 
                    alt="Cachet"
                    onMouseDown={handleDragStart('stamp')}
                    onTouchStart={handleDragStart('stamp')}
                    className={`absolute object-contain cursor-grab active:cursor-grabbing z-10 opacity-90 hover:opacity-100 drop-shadow-md ${dragging === 'stamp' ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                    style={{ 
                      left: `${(currentInvoice.stampPos?.x ?? 15)}%`, 
                      top: `${(currentInvoice.stampPos?.y ?? 80)}%`,
                      width: `${80 * (currentInvoice.stampScale || 1)}px`,
                      height: `${80 * (currentInvoice.stampScale || 1)}px`,
                      transform: `translate(-50%, -50%) rotate(${currentInvoice.stampRotation || 0}deg)`
                    }}
                    draggable={false}
                  />
                )}

                {/* ═══ Draggable Signature Overlay ═══ */}
                {currentInvoice.showSignature && currentInvoice.signatureImageUrl && (
                  <img 
                    src={currentInvoice.signatureImageUrl} 
                    alt="Signature"
                    onMouseDown={handleDragStart('signature')}
                    onTouchStart={handleDragStart('signature')}
                    className={`absolute object-contain cursor-grab active:cursor-grabbing z-10 opacity-90 hover:opacity-100 drop-shadow-md ${dragging === 'signature' ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                    style={{ 
                      left: `${(currentInvoice.signaturePos?.x ?? 75)}%`, 
                      top: `${(currentInvoice.signaturePos?.y ?? 85)}%`,
                      width: `${100 * (currentInvoice.signatureScale || 1)}px`,
                      height: `${55 * (currentInvoice.signatureScale || 1)}px`,
                      transform: `translate(-50%, -50%) rotate(${currentInvoice.signatureRotation || 0}deg)`
                    }}
                    draggable={false}
                  />
                )}

              </div>
            </div>

            {/* Print & Export Actions */}
            <div className="grid grid-cols-2 gap-3 mt-6">
                            <div className="grid grid-cols-2 gap-3 mt-6">
  {/* Bouton Impression */}
  <button 
    onClick={async () => {
      onTriggerToast('Impression en cours...', 'info');
      try {
        await printInvoice(currentInvoice);
      } catch (e) { 
        onTriggerToast('Erreur impression: ' + (e as Error).message, 'warning'); 
      }
    }}
    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
  >
    <Printer className="w-4 h-4" />
    <span>Imprimer Ticket</span>
  </button>

  {/* Bouton PDF */}
  <button 
    onClick={async () => {
      onTriggerToast('Génération PDF...', 'info');
      try {
        await exportPDF(currentInvoice);
        onTriggerToast('PDF prêt !', 'success');
      } catch (e) { 
        onTriggerToast('Erreur PDF: ' + (e as Error).message, 'warning'); 
      }
    }}
    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 px-4 rounded-xl transition-all border border-slate-700 flex items-center justify-center space-x-2"
  >
    <Download className="w-4 h-4 text-blue-400" />
    <span>Télécharger PDF</span>
  </button>
</div>


            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Statut Connexion POS : <strong className="text-emerald-400">En ligne (USB/Bluetooth)</strong></span>
              <span className="underline cursor-pointer hover:text-slate-200">Configurer Imprimante</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
