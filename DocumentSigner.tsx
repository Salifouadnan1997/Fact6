const fileInputRef = useRef<HTMLInputElement>(null); 
import { useState, useRef, useEffect } from 'react';
import { FileUp, Stamp, PenTool, Download, Trash2, Move, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Upload, Check, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { Invoice } from './types';
import { supabase } from './src/config/supabaseClient';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`;

// Background removal
function removeBg(src: string): Promise<string> {
  return new Promise(res => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height); const px = d.data;
      const w = c.width, h = c.height, s = Math.max(5, Math.floor(Math.min(w, h) * 0.1));
      let bR = 0, bG = 0, bB = 0, n = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x < s || x >= w - s || y < s || y >= h - s) { const i = (y * w + x) * 4; bR += px[i]; bG += px[i+1]; bB += px[i+2]; n++; }
      bR = Math.round(bR / n); bG = Math.round(bG / n); bB = Math.round(bB / n);
      for (let i = 0; i < px.length; i += 4) { const dr = px[i]-bR, dg = px[i+1]-bG, db = px[i+2]-bB, dist = Math.sqrt(dr*dr+dg*dg+db*db); if (dist < 30) px[i+3] = 0; else if (dist < 60) px[i+3] = Math.round(((dist-30)/30)*255); }
      ctx.putImageData(d, 0, 0); res(c.toDataURL('image/png'));
    };
    img.onerror = () => res(src); img.src = src;
  });
}

// Stamp generator
function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, startSz: number, minSz: number) {
  let sz = startSz; while (sz > minSz) { ctx.font = `bold ${sz}px Helvetica`; if (ctx.measureText(text).width <= maxW) break; sz--; } ctx.font = `bold ${sz}px Helvetica`;
}
function genStamp(text: string, style: string, color: string): string {
  const c = document.createElement('canvas'); const s = 200; c.width = s; c.height = s;
  const ctx = c.getContext('2d')!; ctx.clearRect(0, 0, s, s); const cx = s/2, cy = s/2, t = text.toUpperCase();
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (style === 'round') {
    ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI*2); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 78, 0, Math.PI*2); ctx.stroke();
    fitText(ctx, t, 130, 26, 8); ctx.fillText(t, cx, cy-8);
    ctx.font = 'bold 11px Helvetica'; ctx.fillText('✓ CERTIFIÉ', cx, cy+18);
  } else if (style === 'square') {
    ctx.lineWidth = 5; ctx.strokeRect(12, 25, s-24, s-50);
    ctx.lineWidth = 2; ctx.strokeRect(20, 33, s-40, s-66);
    fitText(ctx, t, 140, 30, 8); ctx.fillText(t, cx, cy-10);
    ctx.font = 'bold 12px Helvetica'; ctx.fillText('✓ VALIDÉ', cx, cy+22);
  } else if (style === 'elegant') {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.15); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 0, 85, 40, 0, 0, Math.PI*2); ctx.stroke();
    fitText(ctx, t, 140, 22, 8); ctx.fillText(t, 0, -4);
    ctx.font = '9px Georgia'; ctx.globalAlpha = 0.7; ctx.fillText('Document certifié', 0, 18);
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12); ctx.lineWidth = 4;
    ctx.strokeRect(-82, -38, 164, 76); ctx.lineWidth = 1.5; ctx.strokeRect(-76, -32, 152, 64);
    fitText(ctx, t, 136, 28, 8); ctx.fillText(t, 0, -5);
    ctx.font = 'bold 10px Helvetica'; ctx.fillText('✓', 0, 18);
    ctx.restore();
  }
  return c.toDataURL('image/png');
}

const COLORS = ['#dc2626','#1e40af','#059669','#7c3aed','#d97706','#0f172a','#be185d','#0284c7'];
const STYLES = [{id:'classic',l:'▭ Classique'},{id:'round',l:'○ Rond'},{id:'square',l:'□ Carré'},{id:'elegant',l:'◇ Élégant'}];

interface Props { 
  currentInvoice: Invoice; 
  userId: string; 
  onTriggerToast: (m: string, t?: 'success'|'warning'|'info') => void; 
  onNavigateToTab?: (tab: string) => void;
}

export const DocumentSigner: React.FC<Props> = ({ currentInvoice, userId, onTriggerToast, onNavigateToTab }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [docName, setDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [overlays, setOverlays] = useState<any[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const signCanvasRef = useRef<HTMLCanvasElement>(null);

  // Tools state
  const [showTools, setShowTools] = useState(false);
  const [toolTab, setToolTab] = useState<'stamp'|'sign'>('stamp');
  const [stampText, setStampText] = useState('PAYÉ');
  const [stampStyle, setStampStyle] = useState('classic');
  const [stampColor, setStampColor] = useState('#dc2626');
  const [stampImg, setStampImg] = useState(currentInvoice.stampImageUrl || '');
  const [signImg, setSignImg] = useState(currentInvoice.signatureImageUrl || '');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signColor, setSignColor] = useState('#1e293b');

  // Quota guard
  const checkQuota = async (metric: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc("check_and_increment", { 
      p_user_id: userId, 
      p_metric: metric 
    });
    
    if (error) throw error;
    
    if (data?.allowed === false) {
      // Message dynamique basé sur la limite renvoyée par la DB
      const msg = `Vos ${data.limit} ${metric} gratuites sont épuisées 🚀 Passez au plan Pro !`;
      onTriggerToast(msg, "warning");
      if (onNavigateToTab) setTimeout(() => onNavigateToTab('subscription'), 2500);
      return false;
    }
    return true;
  };

  // Sign canvas
  useEffect(() => {
    const cv = signCanvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = signColor; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }, [toolTab, signColor]);

  const startDraw = (e: React.MouseEvent|React.TouchEvent) => {
    const cv = signCanvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    ctx.strokeStyle = signColor; ctx.lineWidth = 2.5;
    setIsDrawing(true); setHasDrawn(true);
    const r = cv.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - r.left : e.clientX - r.left;
    const y = 'touches' in e ? e.touches[0].clientY - r.top : e.clientY - r.top;
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (e: React.MouseEvent|React.TouchEvent) => {
    if (!isDrawing) return;
    const cv = signCanvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const r = cv.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - r.left : e.clientX - r.left;
    const y = 'touches' in e ? e.touches[0].clientY - r.top : e.clientY - r.top;
    ctx.lineTo(x, y); ctx.stroke();
  };
  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => { const cv = signCanvasRef.current; if (!cv) return; const ctx = cv.getContext('2d'); if (!ctx) return; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); setHasDrawn(false); };
  const saveSign = async () => { const cv = signCanvasRef.current; if (!cv) return; const cleaned = await removeBg(cv.toDataURL('image/png')); setSignImg(cleaned); onTriggerToast('Signature enregistrée !', 'success'); };

  // Handlers
  const handleImportDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setDocName(file.name); setOverlays([]); setCurrentPage(0);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => { setPages([ev.target?.result as string]); onTriggerToast('Image importée !', 'success'); };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setLoading(true); onTriggerToast('Conversion du PDF...', 'info');
      try {
        const ab = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        const imgs: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const pg = await pdf.getPage(i); const vp = pg.getViewport({ scale: 2 });
          const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
          await pg.render({ canvasContext: cv.getContext('2d')!, viewport: vp }).promise;
          imgs.push(cv.toDataURL('image/png'));
        }
        setPages(imgs); onTriggerToast(`${imgs.length} page(s) chargée(s) !`, 'success');
      } catch { onTriggerToast('Erreur PDF', 'warning'); }
      setLoading(false);
    } else { onTriggerToast('PDF, JPG, PNG acceptés', 'warning'); }
  };

  const addOverlay = (type: 'stamp'|'signature') => {
    const src = type === 'stamp' ? stampImg : signImg;
    if (!src) { onTriggerToast(`Configurez d'abord votre ${type === 'stamp' ? 'cachet' : 'signature'} ci-dessous.`, 'warning'); setShowTools(true); setToolTab(type === 'stamp' ? 'stamp' : 'sign'); return; }
    setOverlays(prev => [...prev, { id: `ov-${Date.now()}`, type, src, x: 25+Math.random()*30, y: 65+Math.random()*15, scale: 1 }]);
    onTriggerToast(`${type === 'stamp' ? 'Cachet' : 'Signature'} ajouté !`, 'success');
  };

  const removeOverlay = (id: string) => setOverlays(p => p.filter(o => o.id !== id));
  const resizeOverlay = (id: string, d: number) => setOverlays(p => p.map(o => o.id === id ? { ...o, scale: Math.max(0.3, Math.min(3, o.scale + d)) } : o));
  const onDS = (id: string) => (e: React.MouseEvent|React.TouchEvent) => { e.preventDefault(); setDragging(id); };
  const onDM = (e: React.MouseEvent|React.TouchEvent) => { if (!dragging||!containerRef.current) return; const r=containerRef.current.getBoundingClientRect(); const cx='touches' in e?e.touches[0].clientX:e.clientX; const cy='touches' in e?e.touches[0].clientY:e.clientY; setOverlays(p=>p.map(o=>o.id===dragging?{...o,x:Math.max(5,Math.min(95,((cx-r.left)/r.width)*100)),y:Math.max(5,Math.min(95,((cy-r.top)/r.height)*100))}:o)); };
  const onDE = () => setDragging(null);

      const handleExport = async () => {
    alert("Étape 1 : Début de l'exportation");
    if (pages.length === 0) {
      alert("Erreur : Aucune page à exporter");
      return;
    }
    
    alert("Étape 2 : Vérification du quota en cours...");
    try {
      const isAuthorized = await checkQuota('signatures');
      if (!isAuthorized) {
        alert("Erreur : Quota non autorisé ou épuisé");
        return;
      }
    } catch (error: any) {
      alert("CRASH à l'étape 2 (Supabase) : " + error.message);
      return;
    }

    alert("Étape 3 : Quota OK. Préparation du document...");
    onTriggerToast('Génération du document...', 'info');
    
    try {
      let el = document.getElementById('__ds_render') as HTMLDivElement;
      if (!el) { 
        el = document.createElement('div'); 
        el.id = '__ds_render'; 
        el.style.cssText = 'position:fixed;left:-4000px;top:0;z-index:-1;background:#fff;'; 
        document.body.appendChild(el); 
      }

      const pageImg = pages[currentPage];
      let overlayHTML = '';
      overlays.forEach(o => {
        overlayHTML += `<img src="${o.src}" style="position:absolute;left:${o.x}%;top:${o.y}%;transform:translate(-50%,-50%) scale(${o.scale});max-width:${o.type==='stamp'?'120':'150'}px;max-height:${o.type==='stamp'?'120':'80'}px;object-fit:contain;" />`;
      });

      el.innerHTML = `<div style="position:relative;width:600px;background:#fff;">
        <img src="${pageImg}" style="width:100%;height:auto;display:block;" />
        ${overlayHTML}
      </div>`;

      alert("Étape 4 : Lancement de html2canvas...");
      const target = el.firstElementChild as HTMLElement;
      
      const cv = await html2canvas(target, { scale: 1.5, useCORS: true, allowTaint: true, backgroundColor: '#fff', logging: false });
      
      alert("Étape 5 : Lancement de jsPDF...");
      const imgData = cv.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = 190, ph = 277, ratio = cv.width / cv.height;
      let fw = pw, fh = pw / ratio;
      if (fh > ph) { fh = ph; fw = ph * ratio; }
      
      pdf.addImage(imgData, 'JPEG', (210 - fw) / 2, 10, fw, fh);
      pdf.save(`signe_${docName || 'document'}.pdf`);
      
      alert("Étape 6 : Succès ! Le document devrait se télécharger.");
      onTriggerToast('Document téléchargé !', 'success');
    } catch (e: any) {
      alert("CRASH Étape finale : " + (e.message || 'Erreur inconnue'));
    }
  };

  const handlePrint = async () => {
    if (pages.length === 0) return;
    
    // Vérification quota
    const isAuthorized = await checkQuota('signatures');
    if (!isAuthorized) return;

    onTriggerToast('Préparation impression...', 'info');
    try {
      let el = document.getElementById('__ds_render') as HTMLDivElement;
      if (!el) { el = document.createElement('div'); el.id = '__ds_render'; el.style.cssText = 'position:fixed;left:-4000px;top:0;z-index:-1;background:#fff;'; document.body.appendChild(el); }
      const pageImg = pages[currentPage];
      let overlayHTML = '';
      overlays.forEach(o => {
        overlayHTML += `<img src="${o.src}" style="position:absolute;left:${o.x}%;top:${o.y}%;transform:translate(-50%,-50%) scale(${o.scale});max-width:${o.type==='stamp'?'120':'150'}px;max-height:${o.type==='stamp'?'120':'80'}px;object-fit:contain;" />`;
      });
      el.innerHTML = `<div style="position:relative;width:600px;background:#fff;"><img src="${pageImg}" style="width:100%;height:auto;display:block;" />${overlayHTML}</div>`;
      const target = el.firstElementChild as HTMLElement;
      const imgs = target.querySelectorAll('img');
      await Promise.all(Array.from(imgs).map(img => img.complete ? Promise.resolve() : new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r(); setTimeout(r, 3000); })));
      await new Promise(r => setTimeout(r, 200));
      const cv = await html2canvas(target, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#fff', logging: false });
      const du = cv.toDataURL('image/png');
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<!DOCTYPE html><html><head><title>${docName}</title><style>body{margin:0;display:flex;justify-content:center;background:#fff;}img{max-width:100%;height:auto;}@media print{img{max-width:100%;}}</style></head><body><img src="${du}" onload="setTimeout(function(){window.print();},400);"/></body></html>`);
        w.document.close();
      } else { await handleExport(); }
    } catch { onTriggerToast('Erreur impression', 'warning'); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* ... Votre JSX reste inchangé ... */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-1"><FileUp className="w-5 h-5 text-blue-600" /><h1 className="text-lg font-extrabold text-slate-900">Signer un Document</h1></div>
        <p className="text-xs text-slate-500">Importez PDF ou image, configurez cachet/signature, puis positionnez et téléchargez.</p>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <label className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5">
          <FileUp className="w-4 h-4" /><span>Importer</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*" className="hidden" onChange={handleImportDoc} />
        </label>
        {pages.length > 0 && (<>
          <button onClick={() => addOverlay('stamp')} className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl border border-rose-200 flex items-center space-x-1.5"><Stamp className="w-4 h-4" /><span>Cachet</span></button>
          <button onClick={() => addOverlay('signature')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-2 rounded-xl border border-indigo-200 flex items-center space-x-1.5"><PenTool className="w-4 h-4" /><span>Signature</span></button>
          <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center space-x-1.5"><PenTool className="w-3.5 h-3.5" /><span>Imprimer</span></button>
          <button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 ml-auto"><Download className="w-4 h-4" /><span>Télécharger PDF</span></button>
        </>)}
        <button onClick={() => setShowTools(!showTools)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 flex items-center space-x-1.5">
          <Stamp className="w-4 h-4" /><span>{showTools ? 'Masquer outils' : 'Configurer cachet/signature'}</span>
        </button>
      </div>

      {showTools && (
            {showTools && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button onClick={() => setToolTab('stamp')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 ${toolTab==='stamp'?'bg-white text-rose-600 shadow-sm':'text-slate-500'}`}><Stamp className="w-4 h-4" /><span>Cachet</span></button>
            <button onClick={() => setToolTab('sign')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 ${toolTab==='sign'?'bg-white text-indigo-600 shadow-sm':'text-slate-500'}`}><PenTool className="w-4 h-4" /><span>Signature</span></button>
          </div>

          {toolTab === 'stamp' && (
            <div className="space-y-3">
              {stampImg ? (
                <div className="flex items-center space-x-3">
                  <img src={stampImg} alt="Cachet" className="w-16 h-16 object-contain bg-white rounded-lg border p-1" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-600">✓ Cachet prêt</p>
                    <button onClick={() => setStampImg('')} className="text-[10px] text-rose-500 font-bold hover:underline">Supprimer</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="text" value={stampText} onChange={e => setStampText(e.target.value)} placeholder="PAYÉ"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold" />
                  <div className="flex flex-wrap gap-1.5">
                    {STYLES.map(s => <button key={s.id} onClick={() => setStampStyle(s.id)} className={`px-2 py-1 rounded text-[9px] font-bold border ${stampStyle===s.id?'bg-blue-600 text-white border-blue-600':'bg-white text-slate-500 border-slate-200'}`}>{s.l}</button>)}
                  </div>
                  <div className="flex space-x-1.5">
                    {COLORS.map(cl => <button key={cl} onClick={() => setStampColor(cl)} className={`w-5 h-5 rounded-full border ${stampColor===cl?'ring-2 ring-offset-1 ring-slate-900':'border-slate-300'}`} style={{backgroundColor:cl}} />)}
                  </div>
                  <button onClick={() => { setStampImg(genStamp(stampText||'PAYÉ', stampStyle, stampColor)); onTriggerToast('Cachet généré !', 'success'); }}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 rounded-xl shadow-sm flex items-center justify-center space-x-1.5"><Check className="w-4 h-4" /><span>Générer ce cachet</span></button>
                </div>
              )}
              
              {/* BOUTON CORRIGÉ : Importation d'une image de TAMPON (adapté mobile) */}
              <button 
                onClick={() => document.getElementById('stamp-upload-input')?.click()} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-2 rounded-xl border border-slate-200 flex items-center justify-center space-x-1"
              >
                <Upload className="w-3 h-3" /><span>Ou importer un tampon (image)</span>
              </button>
              <input 
                id="stamp-upload-input"
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={async e => { 
                  const f = e.target.files?.[0]; 
                  if (!f) return; 
                  const r = new FileReader(); 
                  r.onload = async ev => {
                    setStampImg(await removeBg(ev.target?.result as string)); 
                    onTriggerToast('Tampon importé !', 'success');
                  }; 
                  r.readAsDataURL(f); 
                }} 
              />

            </div>
          )}

          {toolTab === 'sign' && (
             <div className="space-y-3">
              {signImg ? (
                <div className="flex items-center space-x-3">
                  <img src={signImg} alt="Signature" className="w-24 h-14 object-contain bg-white rounded-lg border p-1" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-600">✓ Signature prête</p>
                    <button onClick={() => setSignImg('')} className="text-[10px] text-rose-500 font-bold hover:underline">Supprimer</button>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Dessiner votre signature :</p>
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] text-slate-400 mr-1">Couleur :</span>
                  {['#1e293b','#1e40af','#dc2626','#059669','#7c3aed','#d97706','#be185d','#0284c7'].map(cl => (
                    <button key={cl} onClick={() => setSignColor(cl)}
                      className={`w-4 h-4 rounded-full border ${signColor===cl?'ring-2 ring-offset-1 ring-slate-900 scale-110':'border-slate-300 hover:scale-110'} transition-transform`}
                      style={{backgroundColor:cl}} />
                  ))}
                </div>
              </div>
              <div className="border-2 border-dashed rounded-xl overflow-hidden bg-white relative" style={{borderColor: signColor + '40'}}>
                <canvas ref={signCanvasRef} width={400} height={120} className="w-full cursor-crosshair touch-none"
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                {!hasDrawn && !signImg && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-slate-300 text-xs">✍️ Signez ici</span></div>}
              </div>
              <div className="flex space-x-2">
                <button onClick={clearCanvas} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-2 rounded-xl border border-slate-200 flex items-center justify-center space-x-1"><RotateCcw className="w-3 h-3" /><span>Effacer</span></button>
                <button onClick={saveSign} disabled={!hasDrawn} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[10px] font-bold py-2 rounded-xl shadow-sm flex items-center justify-center space-x-1"><Check className="w-3 h-3" /><span>Enregistrer</span></button>
              </div>
              <label className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-2 rounded-xl border border-slate-200 flex items-center justify-center space-x-1 cursor-pointer">
                <Upload className="w-3 h-3" /><span>Ou importer une signature (image)</span>
                <input type="file" accept="image/*" className="hidden" onChange={async e => { const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=async ev=>{setSignImg(await removeBg(ev.target?.result as string)); onTriggerToast('Importée !','success');}; r.readAsDataURL(f); }} />
              </label>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center justify-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs text-blue-800 font-bold">Conversion du PDF...</span>
        </div>
      )}

      {pages.length > 0 ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{pages.length > 1 ? `Page ${currentPage+1}/${pages.length}` : 'IMAGE'}</span>
              <span className="text-xs font-bold text-slate-700">{docName}</span>
            </div>
            <span className="text-[10px] text-slate-400 flex items-center space-x-1"><Move className="w-3 h-3" /><span>Glissez</span></span>
          </div>
          {pages.length > 1 && (
            <div className="flex items-center justify-center space-x-3 mb-3">
              <button onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage===0} className="bg-slate-100 hover:bg-slate-200 disabled:opacity-30 p-2 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs font-bold">{currentPage+1} / {pages.length}</span>
              <button onClick={() => setCurrentPage(p => Math.min(pages.length-1, p+1))} disabled={currentPage===pages.length-1} className="bg-slate-100 hover:bg-slate-200 disabled:opacity-30 p-2 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
          {overlays.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {overlays.map(o => (
                <div key={o.id} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 flex items-center space-x-2 text-[10px]">
                  <span className="font-bold">{o.type==='stamp'?'🔴 Cachet':'✍️ Signature'}</span>
                  <button onClick={() => resizeOverlay(o.id, -0.2)}><ZoomOut className="w-3 h-3 text-slate-400 hover:text-slate-700" /></button>
                  <button onClick={() => resizeOverlay(o.id, 0.2)}><ZoomIn className="w-3 h-3 text-slate-400 hover:text-slate-700" /></button>
                  <button onClick={() => removeOverlay(o.id)}><Trash2 className="w-3 h-3 text-rose-400 hover:text-rose-600" /></button>
                </div>
              ))}
            </div>
          )}
          <div ref={containerRef} onMouseMove={onDM} onMouseUp={onDE} onMouseLeave={onDE} onTouchMove={onDM} onTouchEnd={onDE}
            className={`relative bg-white border border-slate-300 rounded-xl overflow-hidden ${dragging?'cursor-grabbing':''}`}>
            <img src={pages[currentPage]} alt="Document" className="w-full h-auto" draggable={false} />
            {overlays.map(o => (
              <img key={o.id} src={o.src} alt={o.type} draggable={false}
                onMouseDown={onDS(o.id)} onTouchStart={onDS(o.id)}
                className={`absolute cursor-grab active:cursor-grabbing z-10 drop-shadow-lg ${dragging===o.id?'ring-2 ring-blue-500 ring-offset-2':'opacity-90 hover:opacity-100'}`}
                style={{left:`${o.x}%`,top:`${o.y}%`,transform:`translate(-50%,-50%) scale(${o.scale})`,maxWidth:o.type==='stamp'?'120px':'150px',maxHeight:o.type==='stamp'?'120px':'80px'}} />
            ))}
          </div>
        </div>
      ) : !loading ? (
        <div className="bg-white p-16 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4">
          <FileUp className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600">Importez votre document</p>
          <p className="text-xs text-slate-400">PDF, JPG, PNG, WEBP — Les PDF sont convertis en images automatiquement</p>
          <label className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md cursor-pointer">
            <FileUp className="w-4 h-4" /><span>Choisir un fichier</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*" className="hidden" onChange={handleImportDoc} />
          </label>
        </div>
      ) : null}
    </div>
  );
};


