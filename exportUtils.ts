import { Invoice } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const fmt = (n: number): string => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

function forceDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function makeQR(data: string): string {
  const c = document.createElement('canvas');
  const s = 100; c.width = s; c.height = s;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, s, s); ctx.fillStyle = '#000';
  let h = 0;
  for (let i = 0; i < data.length; i++) { h = ((h << 5) - h) + data.charCodeAt(i); h |= 0; }
  const cs = 5, cols = Math.floor(s / cs);
  for (let i = 0; i < cols; i++) for (let j = 0; j < cols; j++) {
    if ((Math.sin(i * 12.9898 + j * 78.233 + h) * 43758.5453 % 1 + 1) % 1 > 0.5) ctx.fillRect(i * cs, j * cs, cs, cs);
  }
  const dm = (x: number, y: number) => { ctx.fillStyle = '#000'; ctx.fillRect(x, y, 25, 25); ctx.fillStyle = '#fff'; ctx.fillRect(x + 5, y + 5, 15, 15); ctx.fillStyle = '#000'; ctx.fillRect(x + 8, y + 8, 9, 9); };
  dm(5, 5); dm(s - 30, 5); dm(5, s - 30);
  return c.toDataURL('image/png');
}

function buildHTML(inv: Invoice): HTMLDivElement {
  let el = document.getElementById('__inv_r') as HTMLDivElement | null;
  if (!el) { el = document.createElement('div'); el.id = '__inv_r'; el.style.cssText = 'position:fixed;left:-4000px;top:0;z-index:-1;background:#fff;'; document.body.appendChild(el); }

  const th = inv.paperSize !== 'A4';
  const w = th ? (inv.paperSize === '80mm' ? 320 : 250) : 500;
  const qr = makeQR(inv.qrCodeData || inv.invoiceNumber);
  const logoSize = th ? '42' : '65';
  const logo = inv.logoUrl ? `<img src="${inv.logoUrl}" style="width:${logoSize}px;height:${logoSize}px;object-fit:cover;border-radius:12px;border:2px solid #e2e2e2;" />` : '';

  // Build product table: Produit, P.U, Qté, Poids, Couleur, Total
  const rows = inv.items.map(it => `<tr>
    <td style="padding:4px 5px;border-bottom:1px solid #e5e5e5;font-size:${th ? '9px' : '10px'};">${it.imageUrl ? `<img src="${it.imageUrl}" style="width:22px;height:22px;object-fit:cover;border-radius:3px;margin-right:4px;vertical-align:middle;border:1px solid #ddd;"/>` : ''}${it.name}</td>
    <td style="padding:4px 5px;border-bottom:1px solid #e5e5e5;text-align:right;font-size:${th ? '9px' : '10px'};">${fmt(it.unitPrice)}</td>
    <td style="padding:4px 5px;border-bottom:1px solid #e5e5e5;text-align:center;font-weight:bold;font-size:${th ? '9px' : '10px'};">${it.quantity}</td>
    <td style="padding:4px 5px;border-bottom:1px solid #e5e5e5;text-align:center;font-size:${th ? '8px' : '9px'};">${it.weight || '-'}</td>
    <td style="padding:4px 5px;border-bottom:1px solid #e5e5e5;text-align:center;font-size:${th ? '8px' : '9px'};">${it.color || '-'}</td>
    <td style="padding:4px 5px;border-bottom:1px solid #e5e5e5;text-align:right;font-weight:bold;font-size:${th ? '9px' : '10px'};">${fmt(it.total)}</td>
  </tr>`).join('');

  const pc = inv.primaryColor || '#1e293b';

  el.innerHTML = `<div id="__ic" style="width:${w}px;padding:${th ? '10px' : '14px 18px'};background:#fff;color:#1e293b;font-family:${inv.fontFamily === 'font-mono' ? "'Courier New',monospace" : inv.fontFamily === 'font-serif' ? 'Georgia,serif' : 'Helvetica,Arial,sans-serif'};font-size:${th ? '9px' : '10px'};">

  <!-- ═══ HEADER: QR | TITLE (encadré couleur) | LOGO ═══ -->
  <table style="width:100%;margin-bottom:8px;" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:${th ? '50' : '75'}px;vertical-align:middle;text-align:left;">
        ${inv.showQrCode ? `<img src="${qr}" style="width:${th ? '42' : '65'}px;height:${th ? '42' : '65'}px;" />` : ''}
      </td>
      <td style="text-align:center;vertical-align:middle;padding:0 ${th ? '6' : '10'}px;">
        <div style="border:3px solid ${pc};padding:${th ? '8px 12px' : '12px 20px'};border-radius:8px;display:inline-block;text-align:center;">
          <div style="font-size:${th ? '12px' : '16px'};font-weight:900;letter-spacing:2px;text-transform:uppercase;line-height:1.4;white-space:nowrap;text-align:center;color:${pc};">${inv.companyName}</div>
        </div>
      </td>
      <td style="width:${th ? '50' : '75'}px;vertical-align:middle;text-align:right;">
        ${logo}
      </td>
    </tr>
  </table>

  <!-- ═══ FACTURE N° ═══ -->
  <div style="text-align:center;margin-bottom:8px;font-weight:900;font-size:${th ? '11px' : '13px'};background:${pc}15;color:${pc};padding:4px 0;border-radius:4px;border:1px solid ${pc}30;">
    ${inv.documentType.toUpperCase()} N° ${inv.invoiceNumber} — ${inv.dateTime}
  </div>

  <!-- ═══ FOURNISSEUR | CLIENT — Zones séparées ═══ -->
  <table style="width:100%;margin-bottom:10px;border:1px solid ${pc}40;border-radius:6px;overflow:hidden;" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:50%;vertical-align:top;padding:${th ? '6px' : '8px 10px'};background:${pc}08;border-right:2px solid ${pc}30;">
        <div style="font-size:${th ? '7px' : '8px'};text-transform:uppercase;color:#888;font-weight:900;letter-spacing:1px;margin-bottom:3px;">Fournisseur</div>
        <div style="font-weight:bold;font-size:${th ? '10px' : '11px'};color:#1e293b;">${inv.companyName}</div>
        <div style="font-size:${th ? '8px' : '9px'};color:#555;margin-top:1px;">${inv.address}</div>
        <div style="font-size:${th ? '8px' : '9px'};color:#555;">Tél: ${inv.phone}</div>
        <div style="font-size:${th ? '7px' : '8px'};color:#888;margin-top:2px;">RCCM: ${inv.rccm}</div>
        <div style="font-size:${th ? '7px' : '8px'};color:#888;">IFU: ${inv.ifu}</div>
        ${inv.sellerName ? `<div style="font-size:${th ? '7px' : '8px'};color:#555;margin-top:2px;">Vendeur: ${inv.sellerName}</div>` : ''}
      </td>
      <td style="width:50%;vertical-align:top;padding:${th ? '6px' : '8px 10px'};background:#fff;">
        <div style="font-size:${th ? '7px' : '8px'};text-transform:uppercase;color:#888;font-weight:900;letter-spacing:1px;margin-bottom:3px;">Client</div>
        <div style="font-weight:bold;font-size:${th ? '10px' : '12px'};color:#1e293b;">${inv.clientName || 'Client comptoir'}</div>
        ${inv.clientPhone ? `<div style="font-size:${th ? '9px' : '10px'};color:#555;margin-top:2px;">Tél: ${inv.clientPhone}</div>` : ''}
      </td>
    </tr>
  </table>

  <!-- ═══ TABLEAU GLOBAL DES ACHATS ═══ -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px;font-size:${th ? '9px' : '10px'};">
    <thead>
      <tr style="background:${pc}12;">
        <th style="padding:5px;text-align:left;font-size:${th ? '8px' : '9px'};text-transform:uppercase;color:${pc};border-bottom:2px solid ${pc};font-weight:900;">Produit</th>
        <th style="padding:5px;text-align:right;font-size:${th ? '8px' : '9px'};text-transform:uppercase;color:${pc};border-bottom:2px solid ${pc};font-weight:900;">P.U</th>
        <th style="padding:5px;text-align:center;font-size:${th ? '8px' : '9px'};text-transform:uppercase;color:${pc};border-bottom:2px solid ${pc};font-weight:900;">Qté</th>
        <th style="padding:5px;text-align:center;font-size:${th ? '8px' : '9px'};text-transform:uppercase;color:${pc};border-bottom:2px solid ${pc};font-weight:900;">Poids</th>
        <th style="padding:5px;text-align:center;font-size:${th ? '8px' : '9px'};text-transform:uppercase;color:${pc};border-bottom:2px solid ${pc};font-weight:900;">Couleur</th>
        <th style="padding:5px;text-align:right;font-size:${th ? '8px' : '9px'};text-transform:uppercase;color:${pc};border-bottom:2px solid ${pc};font-weight:900;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <!-- ═══ TOTAUX ═══ -->
  <table style="width:100%;margin-bottom:6px;font-size:${th ? '9px' : '10px'};" cellpadding="0" cellspacing="0">
    <tr><td></td><td style="width:${th ? '160' : '200'}px;">
      <div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #eee;"><span style="color:#666;">Sous-total</span><b>${fmt(inv.subtotal)}</b></div>
      ${inv.discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:2px 0;color:#c00;border-bottom:1px solid #eee;"><span>Remise ${inv.discountRate}%</span><b>-${fmt(inv.discountAmount)}</b></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #eee;"><span style="color:#666;">TVA ${inv.vatRate}%</span><b>${fmt(inv.vatAmount)}</b></div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:${th ? '13px' : '15px'};font-weight:900;border-top:2px solid ${pc};margin-top:2px;color:${pc};"><span>TOTAL TTC</span><span>${fmt(inv.totalAmount)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:3px 6px;background:#e6f7e6;border-radius:4px;margin-top:3px;"><span style="color:#155724;">Payé (${inv.paymentMethod})</span><b style="color:#155724;">${fmt(inv.amountPaid)}</b></div>
      ${inv.totalAmount - inv.amountPaid > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 8px;background:#fef2f2;border:1px solid #fca5a5;border-radius:4px;margin-top:3px;font-weight:900;color:#b91c1c;font-size:${th ? '10px' : '11px'};"><span>RESTE À PAYER</span><span>${fmt(inv.totalAmount - inv.amountPaid)}</span></div>` : ''}
      ${inv.amountPaid - inv.totalAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:3px 6px;background:#f0f0f0;border-radius:4px;margin-top:3px;font-weight:bold;font-size:${th ? '9px' : '10px'};"><span>Monnaie à rendre</span><span>${fmt(inv.amountPaid - inv.totalAmount)}</span></div>` : ''}
    </td></tr>
  </table>

  <!-- ═══ CACHET & SIGNATURE (positionnés, redimensionnés, rotation) ═══ -->
  ${(inv.showStamp && inv.stampImageUrl) || (inv.showSignature && inv.signatureImageUrl) ? `
  <div style="position:relative;min-height:${th ? '60' : '80'}px;margin:6px 0;border-top:1px dashed #ccc;padding-top:6px;">
    ${inv.showStamp && inv.stampImageUrl ? `<img src="${inv.stampImageUrl}" style="position:absolute;left:${inv.stampPos?.x ?? 15}%;top:5px;width:${Math.round((th ? 70 : 100) * (inv.stampScale || 1))}px;height:${Math.round((th ? 70 : 100) * (inv.stampScale || 1))}px;object-fit:contain;transform:translateX(-50%) rotate(${inv.stampRotation || 0}deg);" />` : ''}
    ${inv.showSignature && inv.signatureImageUrl ? `<img src="${inv.signatureImageUrl}" style="position:absolute;right:${100 - (inv.signaturePos?.x ?? 80)}%;top:5px;width:${Math.round((th ? 90 : 120) * (inv.signatureScale || 1))}px;height:${Math.round((th ? 50 : 65) * (inv.signatureScale || 1))}px;object-fit:contain;transform:rotate(${inv.signatureRotation || 0}deg);" />` : ''}
  </div>` : ''}

  <!-- ═══ REMERCIEMENT ═══ -->
  <div style="text-align:center;margin-top:4px;font-size:${th ? '8px' : '9px'};font-style:italic;color:#555;">
    ${inv.thankYouMessage}
  </div>

  <!-- ═══ FOOTER SAAS ═══ -->
  <div style="margin-top:6px;padding-top:4px;border-top:1px dashed #ccc;text-align:center;font-size:${th ? '7px' : '8px'};color:#999;">
    <b>Plateforme SaaS de gestion des factures et commercial</b><br/>
    Besoin de solution digital? Contact: +2290166336546
  </div>
</div>`;
  return el;
}

// ════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════

async function waitImages(target: HTMLElement) {
  const imgs = target.querySelectorAll('img');
  await Promise.all(Array.from(imgs).map(img => img.complete ? Promise.resolve() : new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r(); })));
}

async function capture(target: HTMLElement) {
  return html2canvas(target, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
}

export async function exportPDF(inv: Invoice): Promise<void> {
  const el = buildHTML(inv);
  const t = el.querySelector('#__ic') as HTMLElement;
  if (!t) throw new Error('fail');
  await waitImages(t);
  const canvas = await capture(t);
  const d = canvas.toDataURL('image/jpeg', 0.92);
  const cw = canvas.width, ch = canvas.height;

  if (inv.paperSize === 'A4') {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = 190, ph = 277, r = cw / ch;
    let fw = pw, fh = pw / r;
    if (fh > ph) { fh = ph; fw = ph * r; }
    pdf.addImage(d, 'JPEG', (210 - fw) / 2, 10, fw, fh);
    pdf.save(`${inv.invoiceNumber}.pdf`);
  } else {
    const pW = inv.paperSize === '80mm' ? 80 : 58;
    const pH = (ch * pW) / cw;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pW, pH + 4] });
    pdf.addImage(d, 'JPEG', 0, 2, pW, pH);
    pdf.save(`${inv.invoiceNumber}.pdf`);
  }
}

export async function exportImage(inv: Invoice, format: 'png' | 'jpeg'): Promise<void> {
  const el = buildHTML(inv);
  const t = el.querySelector('#__ic') as HTMLElement;
  if (!t) throw new Error('fail');
  await waitImages(t);
  const canvas = await capture(t);
  const du = canvas.toDataURL(`image/${format}`, 0.95);
  const bs = atob(du.split(',')[1]), ms = du.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(bs.length), ia = new Uint8Array(ab);
  for (let i = 0; i < bs.length; i++) ia[i] = bs.charCodeAt(i);
  forceDownload(new Blob([ab], { type: ms }), `${inv.invoiceNumber}.${format === 'jpeg' ? 'jpg' : 'png'}`);
}

export function exportCSV(inv: Invoice): void {
  const s = ';', l: string[] = [];
  l.push(`Entreprise${s}${inv.companyName}`); l.push(`RCCM${s}${inv.rccm}`); l.push(`IFU${s}${inv.ifu}`); l.push('');
  l.push(`Facture${s}${inv.invoiceNumber}`); l.push(`Date${s}${inv.dateTime}`);
  l.push(`Client${s}${inv.clientName}`); l.push(`Tél${s}${inv.clientPhone || ''}`); l.push('');
  l.push(`Produit${s}Prix${s}Qté${s}Poids${s}Couleur${s}Total`);
  inv.items.forEach(i => l.push(`"${i.name}"${s}${i.unitPrice}${s}${i.quantity}${s}${i.weight || ''}${s}${i.color || ''}${s}${i.total}`));
  l.push(''); l.push(`Total TTC${s}${inv.totalAmount}`);
  forceDownload(new Blob(['\uFEFF' + l.join('\n')], { type: 'text/csv;charset=utf-8;' }), `${inv.invoiceNumber}.csv`);
}

export function exportExcel(inv: Invoice): void {
  const rows = inv.items.map(i => `<Row><Cell><Data ss:Type="String">${i.name}</Data></Cell><Cell><Data ss:Type="Number">${i.unitPrice}</Data></Cell><Cell><Data ss:Type="Number">${i.quantity}</Data></Cell><Cell><Data ss:Type="String">${i.weight || ''}</Data></Cell><Cell><Data ss:Type="String">${i.color || ''}</Data></Cell><Cell><Data ss:Type="Number">${i.total}</Data></Cell></Row>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="B"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="Facture"><Table><Column ss:Width="180"/><Column ss:Width="80"/><Column ss:Width="50"/><Column ss:Width="60"/><Column ss:Width="60"/><Column ss:Width="80"/><Row ss:StyleID="B"><Cell><Data ss:Type="String">${inv.companyName} - ${inv.invoiceNumber}</Data></Cell></Row><Row><Cell><Data ss:Type="String">Client: ${inv.clientName}</Data></Cell><Cell><Data ss:Type="String">${inv.dateTime}</Data></Cell></Row><Row><Cell/></Row><Row ss:StyleID="B"><Cell><Data ss:Type="String">Produit</Data></Cell><Cell><Data ss:Type="String">Prix</Data></Cell><Cell><Data ss:Type="String">Qté</Data></Cell><Cell><Data ss:Type="String">Poids</Data></Cell><Cell><Data ss:Type="String">Couleur</Data></Cell><Cell><Data ss:Type="String">Total</Data></Cell></Row>${rows}<Row><Cell/></Row><Row ss:StyleID="B"><Cell><Data ss:Type="String">TOTAL TTC</Data></Cell><Cell/><Cell/><Cell/><Cell/><Cell><Data ss:Type="Number">${inv.totalAmount}</Data></Cell></Row></Table></Worksheet></Workbook>`;
  forceDownload(new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' }), `${inv.invoiceNumber}.xls`);
}

export async function printInvoice(inv: Invoice): Promise<void> {
  const el = buildHTML(inv);
  const t = el.querySelector('#__ic') as HTMLElement;
  if (!t) throw new Error('fail');
  await waitImages(t);
  const canvas = await capture(t);
  const du = canvas.toDataURL('image/png');
  const pw = window.open('', '_blank');
  if (pw) {
    pw.document.write(`<!DOCTYPE html><html><head><title>${inv.invoiceNumber}</title><style>body{margin:0;display:flex;justify-content:center;background:#fff;}img{max-width:100%;height:auto;}@media print{img{max-width:100%;}}</style></head><body><img src="${du}" onload="setTimeout(function(){window.print();},400);"/></body></html>`);
    pw.document.close();
  } else { await exportPDF(inv); }
}
