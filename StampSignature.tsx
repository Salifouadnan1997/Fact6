import { useState, useRef, useEffect } from 'react';
import { Stamp, PenTool, Upload, Palette, Type, RotateCcw, Download, Check, Trash2 } from 'lucide-react';
import { Invoice } from './types';

interface StampSignatureProps {
  currentInvoice: Invoice;
  onChangeInvoice: (inv: Invoice) => void;
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

// ═══════════════════════════════════════════════
// Background Removal — contrast-based, any paper color
// ═══════════════════════════════════════════════
function removeBackground(imgSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      const px = data.data;
      const w = c.width, h = c.height;

      const s = Math.max(5, Math.floor(Math.min(w, h) * 0.1));
      let bR = 0, bG = 0, bB = 0, n = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (x < s || x >= w - s || y < s || y >= h - s) {
          const i = (y * w + x) * 4; bR += px[i]; bG += px[i+1]; bB += px[i+2]; n++;
        }
      }
      bR = Math.round(bR / n); bG = Math.round(bG / n); bB = Math.round(bB / n);

      for (let i = 0; i < px.length; i += 4) {
        const dr = px[i] - bR, dg = px[i+1] - bG, db = px[i+2] - bB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist < 30) px[i+3] = 0;
        else if (dist < 60) px[i+3] = Math.round(((dist - 30) / 30) * 255);
      }

      ctx.putImageData(data, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imgSrc);
    img.src = imgSrc;
  });
}

// ═══════════════════════════════════════════════
// Colorize: tint all non-transparent pixels to a color
// ═══════════════════════════════════════════════
function colorizeImg(imgSrc: string, color: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) {
        if (d.data[i+3] > 20) { d.data[i]=r; d.data[i+1]=g; d.data[i+2]=b; }
      }
      ctx.putImageData(d, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imgSrc);
    img.src = imgSrc;
  });
}

// ═══════════════════════════════════════════════
// Auto-fit text: reduce font size until it fits within maxWidth
// ═══════════════════════════════════════════════
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, minSize: number, weight: string = 'bold', family: string = 'Helvetica'): number {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  ctx.font = `${weight} ${size}px ${family}`;
  return size;
}

export const StampSignature: React.FC<StampSignatureProps> = ({ currentInvoice, onChangeInvoice, onTriggerToast }) => {
  const [activeTab, setActiveTab] = useState<'stamp' | 'signature'>('stamp');
  const [stampText, setStampText] = useState(currentInvoice.stampText || 'PAYÉ');
  const [stampStyle, setStampStyle] = useState<string>(currentInvoice.stampStyle || 'classic');
  const [stampColor, setStampColor] = useState(currentInvoice.stampColor || '#dc2626');
  const [isRemoving, setIsRemoving] = useState(false);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, rect: DOMRect) => {
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    setIsDrawing(true); setHasDrawn(true);
    const { x, y } = getPos(e, canvas.getBoundingClientRect());
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = getPos(e, canvas.getBoundingClientRect());
    ctx.lineTo(x, y); ctx.stroke();
  };
  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); setHasDrawn(false);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current; if (!canvas) return;
    onTriggerToast('Suppression de l\'arrière-plan...', 'info');
    const raw = canvas.toDataURL('image/png');
    const cleaned = await removeBackground(raw);
    onChangeInvoice({ ...currentInvoice, signatureImageUrl: cleaned, showSignature: true });
    onTriggerToast('Signature enregistrée (arrière-plan supprimé) !', 'success');
  };

  const handleImportWithBgRemoval = async (e: React.ChangeEvent<HTMLInputElement>, type: 'stamp' | 'signature') => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsRemoving(true);
    onTriggerToast('Suppression de l\'arrière-plan en cours...', 'info');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const src = ev.target?.result as string;
      const cleaned = await removeBackground(src);
      if (type === 'stamp') {
        onChangeInvoice({ ...currentInvoice, stampImageUrl: cleaned, showStamp: true });
      } else {
        onChangeInvoice({ ...currentInvoice, signatureImageUrl: cleaned, showSignature: true });
      }
      setIsRemoving(false);
      onTriggerToast('Image importée — arrière-plan supprimé automatiquement !', 'success');
    };
    reader.readAsDataURL(file);
  };

  // ═══ Stamp Generator with auto-fit text ═══
  const generateStamp = (text: string, style: string, color: string): string => {
    const c = document.createElement('canvas');
    const s = 200; c.width = s; c.height = s;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, s, s);
    const cx = s / 2, cy = s / 2;
    const t = text.toUpperCase();

    if (style === 'round') {
      ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 78, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 130, 26, 8);
      ctx.fillText(t, cx, cy - 8);
      ctx.font = 'bold 11px Helvetica'; ctx.fillText('✓ CERTIFIÉ', cx, cy + 18);
      ctx.font = '9px Helvetica'; ctx.globalAlpha = 0.6;
      ctx.fillText(new Date().toLocaleDateString('fr-FR'), cx, cy + 36);
      ctx.globalAlpha = 1;
    } else if (style === 'square') {
      ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(12, 25, s - 24, s - 50);
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.strokeRect(20, 33, s - 40, s - 66);
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 140, 30, 8);
      ctx.fillText(t, cx, cy - 10);
      ctx.font = 'bold 12px Helvetica'; ctx.fillText('✓ VALIDÉ', cx, cy + 22);
    } else if (style === 'elegant') {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.15);
      ctx.strokeStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, 85, 40, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, text, 140, 22, 8, 'italic bold', 'Georgia');
      ctx.fillText(text, 0, -4);
      ctx.font = '9px Georgia'; ctx.globalAlpha = 0.7; ctx.fillText('Document certifié', 0, 18);
      ctx.globalAlpha = 1; ctx.restore();
    } else if (style === 'minimal') {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.1);
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 160, 38, 10);
      ctx.fillText(t, 0, -5);
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-75, 18); ctx.lineTo(75, 18); ctx.stroke();
      ctx.font = '9px Helvetica'; ctx.globalAlpha = 0.5;
      ctx.fillText(new Date().toLocaleDateString('fr-FR'), 0, 35);
      ctx.globalAlpha = 1; ctx.restore();
    } else if (style === 'diamond') {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.strokeRect(-55, -55, 110, 110);
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.strokeRect(-48, -48, 96, 96);
      ctx.restore();
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 100, 20, 8);
      ctx.fillText(t, cx, cy - 5);
      ctx.font = 'bold 9px Helvetica'; ctx.fillText('✓', cx, cy + 14);
    } else if (style === 'star') {
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // Star border
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 90 : 50;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)) : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
      fitText(ctx, t, 80, 18, 7);
      ctx.fillText(t, cx, cy - 3);
      ctx.font = '8px Helvetica'; ctx.fillText('CERTIFIÉ', cx, cy + 14);
    } else if (style === 'ribbon') {
      ctx.save(); ctx.translate(cx, cy);
      // Ribbon shape
      ctx.fillStyle = color; ctx.globalAlpha = 0.15;
      ctx.fillRect(-90, -18, 180, 36);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.strokeRect(-90, -18, 180, 36);
      ctx.beginPath(); ctx.moveTo(-90, -18); ctx.lineTo(-100, 0); ctx.lineTo(-90, 18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(90, -18); ctx.lineTo(100, 0); ctx.lineTo(90, 18); ctx.stroke();
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 160, 20, 8);
      ctx.fillText(t, 0, 0);
      ctx.restore();
    } else if (style === 'seal') {
      // Notary seal style
      ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 82, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      // Inner text
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 70, 18, 7);
      ctx.fillText(t, cx, cy);
      // Curved text around
      ctx.font = 'bold 9px Helvetica';
      const txt = '★ DOCUMENT OFFICIEL ★';
      for (let i = 0; i < txt.length; i++) {
        ctx.save(); ctx.translate(cx, cy);
        ctx.rotate(-Math.PI / 2 + (i / txt.length) * Math.PI * 1.3 + 0.3);
        ctx.fillText(txt[i], 0, -62);
        ctx.restore();
      }
    } else if (style === 'hexagon') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        i === 0 ? ctx.moveTo(cx + 85 * Math.cos(a), cy + 85 * Math.sin(a)) : ctx.lineTo(cx + 85 * Math.cos(a), cy + 85 * Math.sin(a));
      }
      ctx.closePath(); ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        i === 0 ? ctx.moveTo(cx + 75 * Math.cos(a), cy + 75 * Math.sin(a)) : ctx.lineTo(cx + 75 * Math.cos(a), cy + 75 * Math.sin(a));
      }
      ctx.closePath(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 110, 22, 8);
      ctx.fillText(t, cx, cy - 5);
      ctx.font = 'bold 10px Helvetica'; ctx.fillText('✓', cx, cy + 16);
    } else if (style === 'shield') {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 85); ctx.lineTo(cx + 70, cy - 50); ctx.lineTo(cx + 70, cy + 20);
      ctx.quadraticCurveTo(cx, cy + 90, cx, cy + 90);
      ctx.quadraticCurveTo(cx, cy + 90, cx - 70, cy + 20);
      ctx.lineTo(cx - 70, cy - 50); ctx.closePath();
      ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 100, 20, 8);
      ctx.fillText(t, cx, cy - 10);
      ctx.font = 'bold 10px Helvetica'; ctx.globalAlpha = 0.8;
      ctx.fillText('PROTÉGÉ', cx, cy + 15);
      ctx.globalAlpha = 1;
    } else if (style === 'banner') {
      ctx.save(); ctx.translate(cx, cy);
      ctx.strokeStyle = color; ctx.lineWidth = 3;
      ctx.strokeRect(-85, -25, 170, 50);
      // Banner ends
      ctx.fillStyle = color; ctx.globalAlpha = 0.1; ctx.fillRect(-85, -25, 170, 50); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(-85, -25); ctx.lineTo(-85, 25); ctx.lineTo(-95, 12); ctx.lineTo(-85, -1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(85, -25); ctx.lineTo(85, 25); ctx.lineTo(95, 12); ctx.lineTo(85, -1); ctx.stroke();
      // Top/bottom decorations
      ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-70, -30); ctx.lineTo(70, -30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-70, 30); ctx.lineTo(70, 30); ctx.stroke();
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 150, 22, 8);
      ctx.fillText(t, 0, 0);
      ctx.restore();
    } else if (style === 'wave') {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.08);
      // Wavy border
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.05) {
        const r = 80 + Math.sin(a * 8) * 8;
        const x = r * Math.cos(a), y = r * Math.sin(a);
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 120, 22, 8);
      ctx.fillText(t, 0, -5);
      ctx.font = '9px Helvetica'; ctx.globalAlpha = 0.6;
      ctx.fillText(new Date().toLocaleDateString('fr-FR'), 0, 18);
      ctx.globalAlpha = 1; ctx.restore();
    } else if (style === 'stamp3d') {
      ctx.save(); ctx.translate(cx, cy);
      // 3D shadow
      ctx.fillStyle = '#00000020'; ctx.fillRect(-76, -30, 152, 64);
      ctx.translate(-3, -3);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-78, -32, 156, 68);
      ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.strokeRect(-78, -32, 156, 68);
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(-72, -26, 144, 56);
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 126, 24, 8);
      ctx.fillText(t, 0, -3);
      ctx.font = 'bold 9px Helvetica'; ctx.fillText('✓ ORIGINAL', 0, 16);
      ctx.restore();
    } else {
      // classic (default)
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12);
      ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.strokeRect(-82, -38, 164, 76);
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.strokeRect(-76, -32, 152, 64);
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, t, 136, 28, 8);
      ctx.fillText(t, 0, -5);
      ctx.font = 'bold 10px Helvetica'; ctx.fillText('✓', 0, 18);
      ctx.restore();
    }
    return c.toDataURL('image/png');
  };

  const applyGeneratedStamp = () => {
    const dataUrl = generateStamp(stampText, stampStyle, stampColor);
    onChangeInvoice({ ...currentInvoice, stampImageUrl: dataUrl, showStamp: true, stampText, stampStyle: stampStyle as any, stampColor });
    localStorage.setItem('factureset_stamp', JSON.stringify({ stampText, stampStyle, stampColor, stampImageUrl: dataUrl }));
    onTriggerToast('Cachet généré et appliqué !', 'success');
  };

  const colors = ['#dc2626', '#1e40af', '#059669', '#7c3aed', '#d97706', '#0f172a', '#be185d', '#0284c7'];
  const stylesList: { id: string; label: string }[] = [
    { id: 'classic', label: '▭ Classique' },
    { id: 'round', label: '○ Rond' },
    { id: 'square', label: '□ Carré' },
    { id: 'elegant', label: '◇ Élégant' },
    { id: 'minimal', label: '— Minimal' },
    { id: 'diamond', label: '◆ Diamant' },
    { id: 'star', label: '★ Étoile' },
    { id: 'ribbon', label: '⊞ Ruban' },
    { id: 'seal', label: '◎ Sceau' },
    { id: 'hexagon', label: '⬡ Hexagone' },
    { id: 'shield', label: '🛡 Bouclier' },
    { id: 'banner', label: '⚑ Bannière' },
    { id: 'wave', label: '〰 Vague' },
    { id: 'stamp3d', label: '▣ 3D' },
  ];

  const previewUrl = generateStamp(stampText || 'PAYÉ', stampStyle, stampColor);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-1">
          <Stamp className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Cachets & Signatures</h1>
        </div>
        <p className="text-xs text-slate-500">Générez des cachets personnalisés, signez manuellement ou importez un tampon. L'arrière-plan est supprimé automatiquement.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1">
        <button onClick={() => setActiveTab('stamp')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${activeTab === 'stamp' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
          <Stamp className="w-4 h-4" /><span>Cachet / Tampon</span>
        </button>
        <button onClick={() => setActiveTab('signature')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${activeTab === 'signature' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
          <PenTool className="w-4 h-4" /><span>Signature</span>
        </button>
      </div>

      {/* Loading overlay */}
      {isRemoving && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center space-x-3 animate-fadeIn">
          <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs text-blue-800 font-bold">Suppression de l'arrière-plan en cours...</span>
        </div>
      )}

      {/* ═══ CACHET TAB ═══ */}
      {activeTab === 'stamp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Palette className="w-4 h-4 text-blue-600" /><span>Générateur de cachet</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Texte du cachet</label>
              <input type="text" value={stampText} onChange={(e) => setStampText(e.target.value)} placeholder="PAYÉ"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-[10px] text-slate-400 mt-1">Le texte s'adapte automatiquement au cadre</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Style</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {stylesList.map(s => (
                  <button key={s.id} onClick={() => setStampStyle(s.id)}
                    className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${stampStyle === s.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Couleur</label>
              <div className="flex space-x-2">
                {colors.map(c => (
                  <button key={c} onClick={() => setStampColor(c)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${stampColor === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'border-slate-200 hover:scale-105'}`}
                    style={{ backgroundColor: c }}>
                    {stampColor === c && <Check className="w-4 h-4 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={applyGeneratedStamp}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2">
              <Check className="w-4 h-4" /><span>Appliquer ce cachet</span>
            </button>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ou importer un tampon (arrière-plan supprimé auto.)</p>
              <label className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer border border-slate-200">
                <Upload className="w-4 h-4" /><span>Importer une image de tampon</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImportWithBgRemoval(e, 'stamp')} />
              </label>
            </div>

            {currentInvoice.stampImageUrl && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Changer la couleur du cachet importé :</span>
                <div className="flex space-x-2">
                  {colors.map(c => (
                    <button key={`sc-${c}`} onClick={async () => {
                      onTriggerToast('Colorisation...', 'info');
                      const t = await colorizeImg(currentInvoice.stampImageUrl!, c);
                      onChangeInvoice({ ...currentInvoice, stampImageUrl: t, stampColor: c });
                      onTriggerToast('Couleur appliquée !', 'success');
                    }} className="w-6 h-6 rounded-full border-2 border-slate-200 hover:scale-125 transition-transform" style={{ backgroundColor: c }}></button>
                  ))}
                </div>
                <button onClick={() => { onChangeInvoice({ ...currentInvoice, stampImageUrl: undefined, showStamp: false }); onTriggerToast('Cachet supprimé', 'info'); }}
                  className="w-full text-rose-600 hover:bg-rose-50 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-2 border border-rose-200">
                  <Trash2 className="w-4 h-4" /><span>Supprimer le cachet</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Type className="w-4 h-4 text-blue-600" /><span>Aperçu en direct</span>
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex items-center justify-center" style={{ minHeight: '220px', backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px' }}>
              {currentInvoice.stampImageUrl ? (
                <img src={currentInvoice.stampImageUrl} alt="Cachet" className="max-w-[180px] max-h-[180px] object-contain" />
              ) : (
                <img src={previewUrl} alt="Preview" className="max-w-[180px] max-h-[180px] object-contain opacity-80" />
              )}
            </div>
            <p className="text-[10px] text-slate-400 text-center">Damier = zones transparentes (arrière-plan supprimé)</p>
          </div>
        </div>
      )}

      {/* ═══ SIGNATURE TAB ═══ */}
      {activeTab === 'signature' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <PenTool className="w-4 h-4 text-blue-600" /><span>Signer manuellement</span>
            </h3>
            <p className="text-xs text-slate-500">Dessinez votre signature. L'arrière-plan blanc sera supprimé automatiquement.</p>

            <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white relative">
              <canvas ref={canvasRef} width={400} height={180} className="w-full cursor-crosshair touch-none"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-slate-300 text-xs font-medium">Signez ici ✍️</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button onClick={clearCanvas}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 border border-slate-200">
                <RotateCcw className="w-4 h-4" /><span>Effacer</span>
              </button>
              <button onClick={saveSignature} disabled={!hasDrawn}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5">
                <Download className="w-4 h-4" /><span>Enregistrer</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ou importer (arrière-plan supprimé auto.)</p>
              <label className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer border border-slate-200">
                <Upload className="w-4 h-4" /><span>Importer une signature</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImportWithBgRemoval(e, 'signature')} />
              </label>
            </div>

            {currentInvoice.signatureImageUrl && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Changer la couleur de la signature :</span>
                <div className="flex space-x-2">
                  {['#1e293b','#1e40af','#dc2626','#059669','#7c3aed','#d97706','#0f172a','#be185d'].map(c => (
                    <button key={`sg-${c}`} onClick={async () => {
                      onTriggerToast('Colorisation...', 'info');
                      const t = await colorizeImg(currentInvoice.signatureImageUrl!, c);
                      onChangeInvoice({ ...currentInvoice, signatureImageUrl: t });
                      onTriggerToast('Couleur appliquée !', 'success');
                    }} className="w-6 h-6 rounded-full border-2 border-slate-200 hover:scale-125 transition-transform" style={{ backgroundColor: c }}></button>
                  ))}
                </div>
                <button onClick={() => { onChangeInvoice({ ...currentInvoice, signatureImageUrl: undefined, showSignature: false }); onTriggerToast('Signature supprimée', 'info'); }}
                  className="w-full text-rose-600 hover:bg-rose-50 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-2 border border-rose-200">
                  <Trash2 className="w-4 h-4" /><span>Supprimer la signature</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Signature actuelle</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex items-center justify-center" style={{ minHeight: '200px', backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px' }}>
              {currentInvoice.signatureImageUrl ? (
                <img src={currentInvoice.signatureImageUrl} alt="Signature" className="max-w-[300px] max-h-[160px] object-contain" />
              ) : (
                <div className="text-center">
                  <PenTool className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Aucune signature</p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 text-center">Damier = zones transparentes</p>
          </div>
        </div>
      )}
    </div>
  );
};
