import { useState, useRef, useEffect } from 'react';
import { FileUp, Stamp, PenTool, Download, Trash2, Move, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Upload, Check, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { useNavigate } from 'react-router-dom';
import { supabase } from './src/config/supabaseClient';
import { Invoice } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`;

// --- Fonctions Utilitaires ---
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
const STYLES = [{id:'classic',l:'▭ Classique'},{id:'round',l:'○ Rond'},{id:'square',l:'□ Carré'}];

interface Props { 
  currentInvoice: any; 
  userId: string; 
  onTriggerToast: (m: string, t?: 'success'|'warning'|'info') => void; 
  onNavigateToTab?: (tab: string) => void;
}

export const DocumentSigner: React.FC<Props> = ({ currentInvoice, userId, onTriggerToast, onNavigateToTab }) => {
  const navigate = useNavigate();

  // État local
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [docName, setDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [overlays, setOverlays] = useState<any[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const signCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- LOGIQUE QUOTA ---
  const checkQuota = async (metric: string): Promise<boolean> => {
    try {
      let currentUserId = userId; 
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) currentUserId = user.id;
        else {
          onTriggerToast("Vous devez être connecté pour continuer.", "warning");
          return false;
        }
      }

      const { data, error } = await supabase.rpc("check_and_increment", { 
        p_user_id: currentUserId, 
        p_metric: metric 
      });
      
      if (error) {
        onTriggerToast("Erreur serveur : " + error.message, "warning");
        return false;
      }

      if (data?.allowed === false) {
        onTriggerToast(`Vos ${data.limit} ${metric} gratuites sont épuisées 🚀`, "warning");
        setTimeout(() => navigate('/subscription'), 2500);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  };

  // --- SIGNATURE CANVAS ---
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

  // --- HANDLERS ---
  const handleImportDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setDocName(file.name); setOverlays([]); setCurrentPage(0);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => { setPages([ev.target?.result as string]); onTriggerToast('Image importée !', 'success'); };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setLoading(true); onTriggerToast('Conversion du PDF...', 'info');
      try {
        const ab = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        const imgs: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const pg = await pdf.getPage(i); const vp = pg.getViewport({ scale: 1.5 });
          const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
          await pg.render({ canvasContext: cv.getContext('2d')!, viewport: vp }).promise;
          imgs.push(cv.toDataURL('image/jpeg', 0.8));
        }
        setPages(imgs); onTriggerToast(`${imgs.length} page(s) chargée(s) !`, 'success');
      } catch (err: any) { onTriggerToast('Erreur PDF : ' + err.message, 'warning'); }
      setLoading(false);
    } else { onTriggerToast('PDF, JPG, PNG acceptés', 'warning'); }
  };

  const addOverlay = (type: 'stamp'|'signature') => {
    const src = type === 'stamp' ? stampImg : signImg;
    if (!src) { onTriggerToast(`Configurez d'abord votre ${type === 'stamp' ? 'cachet' : 'signature'}`, 'warning'); setShowTools(true); setToolTab(type === 'stamp' ? 'stamp' : 'sign'); return; }
    setOverlays(prev => [...prev, { id: `ov-${Date.now()}`, type, src, x: 25+Math.random()*30, y: 65+Math.random()*15, scale: 1 }]);
  };

  const removeOverlay = (id: string) => setOverlays(p => p.filter(o => o.id !== id));
  const resizeOverlay = (id: string, d: number) => setOverlays(p => p.map(o => o.id === id ? { ...o, scale: Math.max(0.3, Math.min(3, o.scale + d)) } : o));
  
  const onDS = (id: string) => (e: React.MouseEvent | React.TouchEvent) => { if (e.cancelable) e.preventDefault(); setDragging(id); };
  const onDM = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    let cx = 0, cy = 0;
    if ('touches' in e && e.touches.length > 0) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; } 
    else if ('clientX' in e) { cx = e.clientX; cy = e.clientY; } else return;
    const xPercentage = Math.max(5, Math.min(95, ((cx - r.left) / r.width) * 100));
    const yPercentage = Math.max(5, Math.min(95, ((cy - r.top) / r.height) * 100));
    setOverlays(p => p.map(o => o.id === dragging ? { ...o, x: xPercentage, y: yPercentage } : o));
  };
  const onDE = () => setDragging(null);

  const handleExport = async () => {
    if (pages.length === 0) return;
    const isAuthorized = await checkQuota('signatures');
    if (!isAuthorized) return;
    
    onTriggerToast('Génération du document...', 'info');
    try {
      let el = document.getElementById('__ds_render') as HTMLDivElement;
      if (!el) { el = document.createElement('div'); el.id = '__ds_render'; el.style.cssText = 'position:fixed;left:-4000px;top:0;z-index:-1;background:#fff;'; document.body.appendChild(el); }
      const pageImg = pages[currentPage];
      let overlayHTML = ''; overlays.forEach(o => overlayHTML += `<img src="${o.src}" style="position:absolute;left:${o.x}%;top:${o.y}%;transform:translate(-50%,-50%) scale(${o.scale});max-width:${o.type==='stamp'?'120':'150'}px;max-height:${o.type==='stamp'?'120':'80'}px;object-fit:contain;" />`);
      el.innerHTML = `<div style="position:relative;width:600px;background:#fff;"><img src="${pageImg}" style="width:100%;height:auto;display:block;" />${overlayHTML}</div>`;
      const cv = await html2canvas(el.firstElementChild as HTMLElement, { scale: 1.5, useCORS: true, allowTaint: true, backgroundColor: '#fff' });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = cv.toDataURL('image/jpeg', 0.85);
      pdf.addImage(imgData, 'JPEG', 10, 10, 190, (cv.height * 190) / cv.width);
      pdf.save(`signe_${docName || 'doc'}.pdf`);
    } catch (e) { alert("Erreur Export"); }
  };

  const handlePrint = async () => {
    if (pages.length === 0) return;
    const isAuthorized = await checkQuota('signatures');
    if (!isAuthorized) return;
    try {
      let el = document.getElementById('__ds_render') as HTMLDivElement;
      if (!el) { el = document.createElement('div'); el.id = '__ds_render'; el.style.cssText = 'position:fixed;left:-4000px;top:0;z-index:-1;background:#fff;'; document.body.appendChild(el); }
      const pageImg = pages[currentPage];
      let overlayHTML = ''; overlays.forEach(o => overlayHTML += `<img src="${o.src}" style="position:absolute;left:${o.x}%;top:${o.y}%;transform:translate(-50%,-50%) scale(${o.scale});" />`);
      el.innerHTML = `<div style="position:relative;width:600px;"><img src="${pageImg}" style="width:100%;" />${overlayHTML}</div>`;
      const cv = await html2canvas(el.firstElementChild as HTMLElement, { scale: 1.5, useCORS: true, allowTaint: true });
      const w = window.open('', '_blank');
      w?.document.write(`<html><body><img src="${cv.toDataURL()}" onload="window.print();" /></body></html>`);
      w?.document.close();
    } catch { onTriggerToast('Erreur impression', 'warning'); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*" className="hidden" onChange={handleImportDoc} />
      
      {/* Interface simplifiée */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm">
        <h1 className="text-lg font-extrabold text-slate-900">Signer un Document</h1>
      </div>

      <div className="bg-white p-3 rounded-2xl border shadow-sm flex flex-wrap items-center gap-2">
        <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Importer</button>
        {pages.length > 0 && (
          <>
            <button onClick={() => addOverlay('stamp')} className="bg-rose-50 text-rose-700 text-xs px-3 py-2 rounded-xl border">Cachet</button>
            <button onClick={() => addOverlay('signature')} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-2 rounded-xl border">Signature</button>
            <button onClick={handlePrint} className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl">Imprimer</button>
            <button onClick={handleExport} className="bg-emerald-600 text-white text-xs px-3 py-2 rounded-xl ml-auto">Télécharger</button>
          </>
        )}
      </div>

      {showTools && (
        <div className="bg-white p-4 rounded-2xl border shadow-sm">
           {/* ... Ton bloc outils ... */}
           {/* Note: Pour des raisons de lisibilité, ce bloc est la partie répétitive du bas, 
               tu peux garder ton code existant ici, tout le reste (Auth, Quota, Import) est déjà géré au-dessus. */}
        </div>
      )}

      {pages.length > 0 ? (
        <div ref={containerRef} onMouseMove={onDM} onMouseUp={onDE} onMouseLeave={onDE} onTouchMove={onDM} onTouchEnd={onDE}
             className="relative border rounded-xl overflow-hidden cursor-grab">
          <img src={pages[currentPage]} alt="Page" className="w-full h-auto" draggable={false} />
          {overlays.map(o => (
            <img key={o.id} src={o.src} draggable={false} onMouseDown={onDS(o.id)}
                 className="absolute z-10" style={{left:`${o.x}%`,top:`${o.y}%`,transform:`translate(-50%,-50%) scale(${o.scale})`}} />
          ))}
        </div>
      ) : (
         <div className="text-center p-16 border-2 border-dashed border-slate-300 rounded-2xl">
           <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold">Choisir un fichier</button>
         </div>
      )}
    </div>
  );
};
