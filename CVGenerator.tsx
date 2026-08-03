// ═══════════════════════════════════════════════════════════════
// CV Template Engine — 30 Unique Professional Layouts
// Each template has a completely different structure
// ═══════════════════════════════════════════════════════════════

export interface CVData {
  photo: string; nom: string; titre: string; tel: string; email: string;
  adresse: string; ville: string; pays: string; linkedin: string; github: string; portfolio: string;
  facebook: string; youtube: string;
  resume: string; skills: string; langues: string;
  exps: { entreprise: string; poste: string; debut: string; fin: string; description: string }[];
  edus: { etablissement: string; diplome: string; domaine: string; debut: string; fin: string }[];
  certs: { nom: string; organisme: string; date: string }[];
  projs: { nom: string; description: string; technologies: string; lien: string }[];
  refs: { nom: string; poste: string; tel: string; email: string }[];
  stampImg: string; signImg: string;
}

export interface CVTemplate {
  id: string;
  name: string;
  category: string;
  preview: string; // emoji
  render: (d: CVData) => string;
}

// ── Helpers ──
const contactLine = (icon: string, val: string) => val ? `<div style="margin-bottom:5px;font-size:12px;">${icon} ${val}</div>` : '';
const allContacts = (d: CVData) => [
  contactLine('📞', d.tel), contactLine('✉️', d.email),
  contactLine('📍', [d.adresse, d.ville, d.pays].filter(Boolean).join(', ')),
  contactLine('🔗', d.linkedin), contactLine('💻', d.github),
  contactLine('🌐', d.portfolio), contactLine('📘', d.facebook), contactLine('🎬', d.youtube),
].join('');
const sectionTitle = (title: string, color: string, style?: string) => {
  if (style === 'underline') return `<div style="font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:${color};border-bottom:2px solid ${color};padding-bottom:4px;margin:16px 0 8px;">${title}</div>`;
  if (style === 'bg') return `<div style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#fff;background:${color};padding:5px 10px;border-radius:4px;margin:16px 0 8px;">${title}</div>`;
  if (style === 'dot') return `<div style="font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:${color};margin:16px 0 8px;display:flex;align-items:center;"><span style="width:10px;height:10px;background:${color};border-radius:50%;display:inline-block;margin-right:8px;"></span>${title}</div>`;
  if (style === 'side') return `<div style="font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:${color};margin:16px 0 8px;border-left:4px solid ${color};padding-left:10px;">${title}</div>`;
  return `<div style="font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:${color};margin:16px 0 8px;">${title}</div>`;
};
const expBlock = (e: CVData['exps'][0]) => `<div style="margin-bottom:12px;"><div style="font-weight:bold;font-size:14px;">${e.poste}</div><div style="font-size:12px;color:#888;">${e.entreprise} · ${e.debut} — ${e.fin || 'Présent'}</div>${e.description ? `<div style="font-size:12px;color:#555;margin-top:3px;line-height:1.6;">${e.description}</div>` : ''}</div>`;
const eduBlock = (e: CVData['edus'][0]) => `<div style="margin-bottom:10px;"><div style="font-weight:bold;font-size:13px;">${e.diplome}${e.domaine ? ' — ' + e.domaine : ''}</div><div style="font-size:12px;color:#888;">${e.etablissement} · ${e.debut}${e.fin ? ' — ' + e.fin : ''}</div></div>`;
const skillPills = (skills: string, color: string) => skills ? skills.split(',').map(s => `<span style="display:inline-block;background:${color}18;color:${color};font-size:11px;font-weight:bold;padding:3px 10px;border-radius:12px;margin:2px 3px;">${s.trim()}</span>`).join('') : '';
const skillDots = (skills: string, color: string) => skills ? skills.split(',').map(s => `<div style="margin-bottom:5px;font-size:11px;display:flex;justify-content:space-between;align-items:center;"><span>${s.trim()}</span><div style="display:flex;gap:3px;">${[1,2,3,4,5].map(i => `<span style="width:8px;height:8px;border-radius:50%;background:${i <= 3 + Math.floor(Math.random() * 2) ? color : '#e2e8f0'};"></span>`).join('')}</div></div>`).join('') : '';
const skillBars = (skills: string, color: string) => skills ? skills.split(',').map(s => { const pct = 60 + Math.floor(Math.random() * 35); return `<div style="margin-bottom:6px;"><div style="font-size:11px;margin-bottom:2px;display:flex;justify-content:space-between;"><span>${s.trim()}</span><span style="color:#aaa;">${pct}%</span></div><div style="height:5px;background:#e5e5e5;border-radius:3px;"><div style="height:5px;background:${color};border-radius:3px;width:${pct}%;"></div></div></div>`; }).join('') : '';
const photoCircle = (photo: string, size: number, border?: string) => photo ? `<img src="${photo}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;${border || ''}" />` : '';
const photoSquare = (photo: string, size: number) => photo ? `<img src="${photo}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:8px;" />` : '';
const stampSign = (d: CVData) => (d.stampImg || d.signImg) ? `<div style="display:flex;justify-content:space-around;align-items:center;margin-top:10px;padding-top:6px;border-top:1px dashed #ddd;">${d.stampImg ? `<img src="${d.stampImg}" style="max-width:50px;max-height:50px;"/>` : ''}${d.signImg ? `<img src="${d.signImg}" style="max-width:70px;max-height:35px;"/>` : ''}</div>` : '';

// ═══════════════════════════════════════
// TEMPLATES — Each with unique layout
// ═══════════════════════════════════════

export const CV_TEMPLATES: CVTemplate[] = [

  // ── 1. SIDEBAR LEFT CLASSIC ──
  { id:'t1', name:'Classique', category:'Professionnel', preview:'📋',
    render: d => `<div style="width:520px;display:flex;font-family:Helvetica,sans-serif;font-size:9px;color:#1e293b;">
      <div style="width:170px;background:#1e293b;color:#fff;padding:18px 12px;">
        ${photoCircle(d.photo, 70, 'border:3px solid #fff;display:block;margin:0 auto 10px;')}
        ${sectionTitle('Contact','#94a3b8')}${allContacts(d)}
        ${d.skills?sectionTitle('Compétences','#94a3b8'):''}${skillDots(d.skills,'#60a5fa')}
        ${d.langues?sectionTitle('Langues','#94a3b8'):''}${d.langues?d.langues.split(',').map(l=>`<div style="font-size:8px;margin-bottom:2px;">• ${l.trim()}</div>`).join(''):''}
      </div>
      <div style="flex:1;padding:18px;">
        <div style="font-size:22px;font-weight:900;color:#1e293b;">${d.nom||'Votre Nom'}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">${d.titre||'Titre'}</div>
        ${d.resume?sectionTitle('Profil','#1e293b','underline')+`<div style="font-size:9px;color:#555;line-height:1.5;">${d.resume}</div>`:''}
        ${d.exps.length?sectionTitle('Expériences','#1e293b','underline')+d.exps.map(expBlock).join(''):''}
        ${d.edus.length?sectionTitle('Formation','#1e293b','underline')+d.edus.map(eduBlock).join(''):''}
        ${d.certs.length?sectionTitle('Certifications','#1e293b','underline')+d.certs.map(c=>`<div style="font-size:8px;margin-bottom:2px;">✓ ${c.nom} — ${c.organisme} (${c.date})</div>`).join(''):''}
        ${d.projs.length?sectionTitle('Projets','#1e293b','underline')+d.projs.map(p=>`<div style="margin-bottom:5px;"><div style="font-weight:bold;font-size:9px;">${p.nom}</div><div style="font-size:8px;color:#888;">${p.description}</div><div style="font-size:7px;color:#aaa;">${p.technologies}</div></div>`).join(''):''}
        ${d.refs.length?sectionTitle('Références','#1e293b','underline')+d.refs.map(r=>`<div style="font-size:8px;margin-bottom:2px;">${r.nom} — ${r.poste} · ${r.tel}</div>`).join(''):''}
        ${stampSign(d)}
      </div></div>`},

  // ── 2. HEADER FULL WIDTH ──
  { id:'t2', name:'Header Premium', category:'Moderne', preview:'🎯',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:9px;color:#1e293b;">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:20px;color:#fff;display:flex;align-items:center;">
        ${photoCircle(d.photo, 65, 'border:3px solid #fff;margin-right:14px;')}
        <div><div style="font-size:24px;font-weight:900;">${d.nom||'Votre Nom'}</div><div style="font-size:12px;opacity:0.9;margin-top:2px;">${d.titre||'Titre'}</div>
        <div style="margin-top:6px;font-size:8px;opacity:0.8;">${[d.tel,d.email,d.ville].filter(Boolean).join(' · ')}</div></div>
      </div>
      <div style="padding:16px 20px;">
        ${d.resume?`<div style="background:#f8f7ff;border-left:4px solid #7c3aed;padding:10px;border-radius:0 8px 8px 0;margin-bottom:12px;font-size:9px;color:#555;line-height:1.5;">${d.resume}</div>`:''}
        <div style="display:flex;gap:16px;">
          <div style="flex:1;">
            ${d.exps.length?sectionTitle('Expériences','#4f46e5','dot')+d.exps.map(expBlock).join(''):''}
            ${d.edus.length?sectionTitle('Formation','#4f46e5','dot')+d.edus.map(eduBlock).join(''):''}
          </div>
          <div style="width:170px;">
            ${d.skills?sectionTitle('Compétences','#4f46e5','dot'):''}${skillPills(d.skills,'#4f46e5')}
            ${d.langues?sectionTitle('Langues','#4f46e5','dot'):''}${d.langues?d.langues.split(',').map(l=>`<div style="font-size:8px;margin-bottom:2px;">• ${l.trim()}</div>`).join(''):''}
            ${d.certs.length?sectionTitle('Certifications','#4f46e5','dot'):''}${d.certs.map(c=>`<div style="font-size:8px;margin-bottom:2px;">✓ ${c.nom}</div>`).join('')}
          </div>
        </div>${stampSign(d)}
      </div></div>`},

  // ── 3. SIDEBAR RIGHT ──
  { id:'t3', name:'Sidebar Droite', category:'Corporate', preview:'📊',
    render: d => `<div style="width:520px;display:flex;font-family:Georgia,serif;font-size:9px;color:#1e293b;">
      <div style="flex:1;padding:18px;">
        <div style="font-size:20px;font-weight:900;color:#0f172a;">${d.nom||'Votre Nom'}</div>
        <div style="font-size:10px;color:#475569;margin-top:2px;text-transform:uppercase;letter-spacing:2px;">${d.titre||'Titre'}</div>
        ${d.resume?sectionTitle('Profil','#334155','side')+`<div style="font-size:9px;color:#555;line-height:1.5;">${d.resume}</div>`:''}
        ${d.exps.length?sectionTitle('Expériences','#334155','side')+d.exps.map(expBlock).join(''):''}
        ${d.edus.length?sectionTitle('Formation','#334155','side')+d.edus.map(eduBlock).join(''):''}
        ${stampSign(d)}
      </div>
      <div style="width:170px;background:#f1f5f9;padding:18px 12px;border-left:3px solid #334155;">
        ${photoSquare(d.photo, 80)}
        ${sectionTitle('Contact','#334155')}${contactLine('📞',d.tel)}${contactLine('✉️',d.email)}${contactLine('📍',`${d.ville} ${d.pays}`)}
        ${d.skills?sectionTitle('Compétences','#334155'):''}${skillBars(d.skills,'#334155')}
        ${d.langues?sectionTitle('Langues','#334155'):''}${d.langues?d.langues.split(',').map(l=>`<div style="font-size:8px;margin-bottom:2px;">• ${l.trim()}</div>`).join(''):''}
      </div></div>`},

  // ── 4. TIMELINE ──
  { id:'t4', name:'Timeline', category:'Créatif', preview:'⏳',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:9px;color:#1e293b;padding:20px;">
      <div style="text-align:center;margin-bottom:14px;">
        ${photoCircle(d.photo, 60, 'display:block;margin:0 auto 8px;')}
        <div style="font-size:22px;font-weight:900;color:#059669;">${d.nom||'Votre Nom'}</div>
        <div style="font-size:10px;color:#666;">${d.titre||'Titre'}</div>
        <div style="font-size:8px;color:#999;margin-top:4px;">${[d.tel,d.email,d.ville].filter(Boolean).join(' · ')}</div>
      </div>
      ${d.resume?`<div style="text-align:center;font-size:9px;color:#555;line-height:1.5;margin-bottom:12px;max-width:400px;margin-left:auto;margin-right:auto;">${d.resume}</div>`:''}
      ${d.exps.length?sectionTitle('Parcours','#059669','bg'):''}
      ${d.exps.map(e=>`<div style="display:flex;margin-bottom:8px;"><div style="width:3px;background:#059669;margin-right:10px;border-radius:2px;position:relative;"><div style="width:9px;height:9px;background:#059669;border-radius:50%;position:absolute;top:2px;left:-3px;"></div></div><div><div style="font-weight:bold;font-size:10px;">${e.poste}</div><div style="font-size:8px;color:#888;">${e.entreprise} · ${e.debut} — ${e.fin||'Présent'}</div>${e.description?`<div style="font-size:8px;color:#555;margin-top:2px;">${e.description}</div>`:''}</div></div>`).join('')}
      <div style="display:flex;gap:16px;margin-top:10px;">
        <div style="flex:1;">${d.edus.length?sectionTitle('Formation','#059669','bg')+d.edus.map(eduBlock).join(''):''}</div>
        <div style="flex:1;">${d.skills?sectionTitle('Compétences','#059669','bg'):''}${skillPills(d.skills,'#059669')}</div>
      </div>${stampSign(d)}
    </div>`},

  // ── 5. ATS FRIENDLY ──
  { id:'t5', name:'ATS Friendly', category:'ATS', preview:'✅',
    render: d => `<div style="width:520px;font-family:'Courier New',monospace;font-size:9px;color:#000;padding:20px;">
      <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:10px;">
        <div style="font-size:20px;font-weight:bold;text-transform:uppercase;">${d.nom||'VOTRE NOM'}</div>
        <div style="font-size:10px;margin-top:2px;">${d.titre||'Titre Professionnel'}</div>
        <div style="font-size:8px;margin-top:4px;">${[d.tel,d.email,d.adresse,d.ville,d.pays,d.linkedin].filter(Boolean).join(' | ')}</div>
      </div>
      ${d.resume?`<div style="margin-bottom:10px;"><div style="font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;margin-bottom:4px;">RÉSUMÉ PROFESSIONNEL</div><div style="font-size:9px;line-height:1.5;">${d.resume}</div></div>`:''}
      ${d.exps.length?`<div style="margin-bottom:10px;"><div style="font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;margin-bottom:4px;">EXPÉRIENCE PROFESSIONNELLE</div>${d.exps.map(e=>`<div style="margin-bottom:8px;"><div style="font-weight:bold;">${e.poste} — ${e.entreprise}</div><div style="font-size:8px;color:#555;">${e.debut} — ${e.fin||'Présent'}</div>${e.description?`<div style="font-size:8px;margin-top:2px;">${e.description}</div>`:''}</div>`).join('')}</div>`:''}
      ${d.edus.length?`<div style="margin-bottom:10px;"><div style="font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;margin-bottom:4px;">FORMATION</div>${d.edus.map(e=>`<div style="margin-bottom:4px;"><div style="font-weight:bold;">${e.diplome} — ${e.etablissement}</div><div style="font-size:8px;">${e.debut}</div></div>`).join('')}</div>`:''}
      ${d.skills?`<div style="margin-bottom:10px;"><div style="font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;margin-bottom:4px;">COMPÉTENCES</div><div style="font-size:9px;">${d.skills}</div></div>`:''}
      ${d.langues?`<div><div style="font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;margin-bottom:4px;">LANGUES</div><div style="font-size:9px;">${d.langues}</div></div>`:''}
      ${stampSign(d)}
    </div>`},

  // ── 6. CARDS MODERN ──
  { id:'t6', name:'Cartes Modernes', category:'Startup', preview:'🃏',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:9px;color:#1e293b;padding:16px;background:#f8fafc;">
      <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1);display:flex;align-items:center;">
        ${photoCircle(d.photo, 55, 'margin-right:12px;')}
        <div><div style="font-size:20px;font-weight:900;color:#2563eb;">${d.nom||'Votre Nom'}</div><div style="font-size:10px;color:#666;">${d.titre||'Titre'}</div><div style="font-size:8px;color:#999;margin-top:3px;">${[d.tel,d.email,d.ville].filter(Boolean).join(' · ')}</div></div>
      </div>
      ${d.resume?`<div style="background:#fff;border-radius:12px;padding:12px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1);border-left:4px solid #2563eb;"><div style="font-size:9px;color:#555;line-height:1.5;">${d.resume}</div></div>`:''}
      <div style="display:flex;gap:10px;">
        <div style="flex:1;">
          ${d.exps.map(e=>`<div style="background:#fff;border-radius:10px;padding:10px;margin-bottom:8px;box-shadow:0 1px 2px rgba(0,0,0,0.06);"><div style="font-weight:bold;font-size:10px;color:#2563eb;">${e.poste}</div><div style="font-size:8px;color:#888;">${e.entreprise} · ${e.debut}—${e.fin||'Présent'}</div>${e.description?`<div style="font-size:8px;color:#555;margin-top:3px;">${e.description}</div>`:''}</div>`).join('')}
          ${d.edus.map(e=>`<div style="background:#fff;border-radius:10px;padding:10px;margin-bottom:8px;box-shadow:0 1px 2px rgba(0,0,0,0.06);"><div style="font-weight:bold;font-size:9px;">${e.diplome}</div><div style="font-size:8px;color:#888;">${e.etablissement}</div></div>`).join('')}
        </div>
        <div style="width:160px;">${d.skills?`<div style="background:#fff;border-radius:10px;padding:10px;margin-bottom:8px;box-shadow:0 1px 2px rgba(0,0,0,0.06);"><div style="font-weight:bold;font-size:9px;color:#2563eb;margin-bottom:4px;">Compétences</div>${skillPills(d.skills,'#2563eb')}</div>`:''}</div>
      </div>${stampSign(d)}
    </div>`},

  // ── 7. MINIMAL BLACK ──
  { id:'t7', name:'Noir Minimal', category:'Minimaliste', preview:'⬛',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:9px;color:#000;padding:24px;">
      <div style="font-size:28px;font-weight:100;letter-spacing:4px;text-transform:uppercase;">${d.nom||'Votre Nom'}</div>
      <div style="font-size:10px;color:#888;letter-spacing:2px;margin-top:2px;text-transform:uppercase;">${d.titre||'Titre'}</div>
      <div style="height:1px;background:#000;margin:12px 0;"></div>
      <div style="font-size:8px;color:#888;margin-bottom:12px;">${[d.tel,d.email,d.ville,d.linkedin].filter(Boolean).join(' — ')}</div>
      ${d.resume?`<div style="font-size:9px;color:#555;line-height:1.6;margin-bottom:14px;">${d.resume}</div>`:''}
      ${d.exps.length?`<div style="font-size:8px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Expérience</div>${d.exps.map(e=>`<div style="margin-bottom:8px;display:flex;"><div style="width:80px;font-size:8px;color:#aaa;flex-shrink:0;">${e.debut}<br/>${e.fin||'Présent'}</div><div><div style="font-weight:bold;font-size:9px;">${e.poste}</div><div style="font-size:8px;color:#888;">${e.entreprise}</div>${e.description?`<div style="font-size:8px;color:#666;margin-top:1px;">${e.description}</div>`:''}</div></div>`).join('')}`:''}
      ${d.edus.length?`<div style="font-size:8px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:10px 0 6px;">Formation</div>${d.edus.map(e=>`<div style="margin-bottom:4px;display:flex;"><div style="width:80px;font-size:8px;color:#aaa;flex-shrink:0;">${e.debut}</div><div><div style="font-weight:bold;font-size:9px;">${e.diplome}</div><div style="font-size:8px;color:#888;">${e.etablissement}</div></div></div>`).join('')}`:''}
      ${d.skills?`<div style="font-size:8px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:10px 0 4px;">Compétences</div><div style="font-size:8px;color:#555;">${d.skills}</div>`:''}
      ${stampSign(d)}
    </div>`},

  // ── 8. TWO COLUMN EQUAL ──
  { id:'t8', name:'Deux Colonnes', category:'Moderne', preview:'📰',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:9px;color:#1e293b;padding:18px;">
      <div style="text-align:center;margin-bottom:12px;">
        ${photoCircle(d.photo, 50, 'display:block;margin:0 auto 6px;border:2px solid #dc2626;')}
        <div style="font-size:20px;font-weight:900;color:#dc2626;">${d.nom||'Nom'}</div>
        <div style="font-size:10px;color:#666;">${d.titre||'Titre'}</div>
        <div style="font-size:8px;color:#aaa;margin-top:3px;">${[d.tel,d.email,d.ville].filter(Boolean).join(' · ')}</div>
      </div>
      ${d.resume?`<div style="background:#fef2f2;padding:8px 10px;border-radius:8px;font-size:9px;color:#555;line-height:1.5;margin-bottom:10px;">${d.resume}</div>`:''}
      <div style="display:flex;gap:14px;">
        <div style="flex:1;">${d.exps.length?sectionTitle('Expériences','#dc2626','dot')+d.exps.map(expBlock).join(''):''}\n${d.projs.length?sectionTitle('Projets','#dc2626','dot')+d.projs.map(p=>`<div style="margin-bottom:4px;"><div style="font-weight:bold;font-size:9px;">${p.nom}</div><div style="font-size:8px;color:#888;">${p.description}</div></div>`).join(''):''}</div>
        <div style="flex:1;">${d.edus.length?sectionTitle('Formation','#dc2626','dot')+d.edus.map(eduBlock).join(''):''}\n${d.skills?sectionTitle('Compétences','#dc2626','dot')+skillBars(d.skills,'#dc2626'):''}${d.langues?sectionTitle('Langues','#dc2626','dot')+d.langues.split(',').map(l=>`<div style="font-size:8px;margin-bottom:2px;">• ${l.trim()}</div>`).join(''):''}</div>
      </div>${stampSign(d)}
    </div>`},

  // ── 9. EXECUTIVE ──
  { id:'t9', name:'Executive', category:'Executive', preview:'👔',
    render: d => `<div style="width:520px;font-family:Georgia,serif;font-size:9px;color:#0f172a;padding:22px;border:2px solid #0f172a;">
      <div style="border-bottom:3px double #0f172a;padding-bottom:12px;margin-bottom:12px;">
        <div style="font-size:26px;font-weight:bold;text-align:center;letter-spacing:3px;">${(d.nom||'VOTRE NOM').toUpperCase()}</div>
        <div style="text-align:center;font-size:11px;color:#475569;margin-top:3px;font-style:italic;">${d.titre||'Titre'}</div>
        <div style="text-align:center;font-size:8px;color:#94a3b8;margin-top:4px;">${[d.tel,d.email,d.ville,d.linkedin].filter(Boolean).join(' │ ')}</div>
      </div>
      ${d.resume?`<div style="font-style:italic;font-size:9px;color:#475569;line-height:1.6;margin-bottom:12px;text-align:justify;">${d.resume}</div>`:''}
      ${d.exps.length?sectionTitle('EXPÉRIENCE PROFESSIONNELLE','#0f172a','underline')+d.exps.map(expBlock).join(''):''}
      ${d.edus.length?sectionTitle('FORMATION ACADÉMIQUE','#0f172a','underline')+d.edus.map(eduBlock).join(''):''}
      <div style="display:flex;gap:14px;margin-top:8px;">
        <div style="flex:1;">${d.skills?sectionTitle('COMPÉTENCES','#0f172a','underline')+`<div style="font-size:8px;">${d.skills}</div>`:''}</div>
        <div style="flex:1;">${d.langues?sectionTitle('LANGUES','#0f172a','underline')+`<div style="font-size:8px;">${d.langues}</div>`:''}</div>
      </div>${stampSign(d)}
    </div>`},

  // ── 10. DEVELOPER DARK ──
  { id:'t10', name:'Dev Dark', category:'Développeur', preview:'💻',
    render: d => `<div style="width:520px;font-family:'Courier New',monospace;font-size:9px;color:#e2e8f0;background:#0f172a;padding:18px;">
      <div style="color:#22d3ee;font-size:10px;margin-bottom:2px;">// ${d.titre||'developer'}</div>
      <div style="font-size:22px;font-weight:900;color:#f1f5f9;">${d.nom||'<Votre_Nom />'}</div>
      <div style="font-size:8px;color:#64748b;margin-top:4px;margin-bottom:12px;">${[d.tel,d.email,d.github,d.portfolio].filter(Boolean).join(' | ')}</div>
      ${d.resume?`<div style="background:#1e293b;padding:10px;border-radius:6px;border-left:3px solid #22d3ee;margin-bottom:12px;font-size:9px;color:#94a3b8;line-height:1.5;"><span style="color:#22d3ee;">/*</span> ${d.resume} <span style="color:#22d3ee;">*/</span></div>`:''}
      ${d.skills?`<div style="margin-bottom:12px;"><div style="color:#22d3ee;font-size:9px;margin-bottom:6px;">const skills = [</div>${skillPills(d.skills,'#22d3ee')}<div style="color:#22d3ee;font-size:9px;margin-top:4px;">];</div></div>`:''}
      ${d.exps.length?`<div style="color:#22d3ee;font-size:9px;margin-bottom:4px;">// experience</div>${d.exps.map(e=>`<div style="background:#1e293b;padding:8px;border-radius:6px;margin-bottom:6px;"><div style="color:#f1f5f9;font-weight:bold;">${e.poste}</div><div style="font-size:8px;color:#64748b;">${e.entreprise} · ${e.debut}—${e.fin||'now'}</div></div>`).join('')}`:''}
      ${d.projs.length?`<div style="color:#22d3ee;font-size:9px;margin:8px 0 4px;">// projects</div>${d.projs.map(p=>`<div style="background:#1e293b;padding:8px;border-radius:6px;margin-bottom:6px;"><div style="color:#f1f5f9;font-weight:bold;">${p.nom}</div><div style="font-size:8px;color:#64748b;">${p.description}</div></div>`).join('')}`:''}
      ${stampSign(d)}
    </div>`},
];

// Add more templates with simpler variations but still unique layouts
const moreTemplates: CVTemplate[] = [
  { id:'t11', name:'Marketing Pro', category:'Marketing', preview:'📈',
    render: d => { const c='#d97706'; return `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:9px;color:#1e293b;">
      <div style="background:${c};padding:16px 18px;color:#fff;"><div style="font-size:24px;font-weight:900;">${d.nom||'Nom'}</div><div style="font-size:11px;opacity:0.9;">${d.titre||'Titre'}</div></div>
      <div style="display:flex;"><div style="width:4px;background:${c};"></div><div style="flex:1;padding:16px 18px;">
      ${d.resume?`<div style="font-size:9px;color:#555;line-height:1.5;margin-bottom:10px;padding:8px;background:#fffbeb;border-radius:6px;">${d.resume}</div>`:''}
      ${d.exps.length?sectionTitle('Expériences',c,'bg')+d.exps.map(expBlock).join(''):''}
      <div style="display:flex;gap:12px;">${d.skills?`<div style="flex:1;">${sectionTitle('Skills',c,'bg')}${skillPills(d.skills,c)}</div>`:''}<div style="flex:1;">${d.edus.length?sectionTitle('Formation',c,'bg')+d.edus.map(eduBlock).join(''):''}</div></div>
      ${stampSign(d)}</div></div></div>`; }},
  { id:'t12', name:'Étudiant Fresh', category:'Étudiant', preview:'🎓',
    render: d => { const c='#0891b2'; return `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:9px;color:#1e293b;padding:18px;">
      <div style="display:flex;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:3px solid ${c};">${photoCircle(d.photo,50,'margin-right:12px;border:2px solid '+c+';')}<div><div style="font-size:20px;font-weight:900;color:${c};">${d.nom||'Nom'}</div><div style="font-size:10px;color:#666;">${d.titre||'Titre'}</div><div style="font-size:8px;color:#aaa;margin-top:2px;">${[d.tel,d.email].filter(Boolean).join(' · ')}</div></div></div>
      ${d.resume?`<div style="font-size:9px;color:#555;line-height:1.5;margin-bottom:10px;">${d.resume}</div>`:''}
      ${d.edus.length?sectionTitle('Formation',c,'dot')+d.edus.map(eduBlock).join(''):''}
      ${d.exps.length?sectionTitle('Expériences',c,'dot')+d.exps.map(expBlock).join(''):''}
      ${d.skills?sectionTitle('Compétences',c,'dot')+skillPills(d.skills,c):''}
      ${stampSign(d)}</div>`; }},
  { id:'t13', name:'Infographique', category:'Créatif', preview:'📊',
    render: d => { const c='#7c3aed'; return `<div style="width:520px;display:flex;font-family:Helvetica,sans-serif;font-size:9px;">
      <div style="width:180px;background:linear-gradient(180deg,${c},#4f46e5);color:#fff;padding:18px 12px;">
      ${photoCircle(d.photo,65,'border:3px solid #fff;display:block;margin:0 auto 10px;')}
      <div style="text-align:center;font-size:14px;font-weight:900;margin-bottom:2px;">${d.nom||'Nom'}</div>
      <div style="text-align:center;font-size:8px;opacity:0.8;margin-bottom:10px;">${d.titre||'Titre'}</div>
      ${contactLine('📞',d.tel)}${contactLine('✉️',d.email)}${contactLine('📍',d.ville)}${contactLine('🔗',d.linkedin)}
      ${d.skills?`<div style="margin-top:10px;font-size:7px;opacity:0.7;text-transform:uppercase;margin-bottom:4px;">Compétences</div>${skillBars(d.skills,'#a78bfa')}`:''}</div>
      <div style="flex:1;padding:18px;color:#1e293b;">
      ${d.resume?sectionTitle('Profil',c,'underline')+`<div style="font-size:9px;color:#555;line-height:1.5;">${d.resume}</div>`:''}
      ${d.exps.length?sectionTitle('Parcours',c,'underline')+d.exps.map(expBlock).join(''):''}
      ${d.edus.length?sectionTitle('Formation',c,'underline')+d.edus.map(eduBlock).join(''):''}
      ${stampSign(d)}</div></div>`; }},
  { id:'t14', name:'Luxe Gold', category:'Premium', preview:'👑',
    render: d => `<div style="width:520px;font-family:Georgia,serif;font-size:9px;color:#1e293b;padding:20px;background:linear-gradient(180deg,#fffbeb,#fff);">
      <div style="text-align:center;padding-bottom:12px;border-bottom:2px solid #d97706;">
      ${photoCircle(d.photo,55,'display:block;margin:0 auto 8px;border:2px solid #d97706;')}
      <div style="font-size:22px;font-weight:bold;color:#92400e;letter-spacing:2px;">${(d.nom||'Nom').toUpperCase()}</div>
      <div style="font-size:10px;color:#b45309;font-style:italic;">${d.titre||'Titre'}</div></div>
      <div style="text-align:center;font-size:8px;color:#aaa;margin:6px 0 12px;">${[d.tel,d.email,d.ville].filter(Boolean).join(' ✦ ')}</div>
      ${d.resume?`<div style="font-style:italic;color:#555;line-height:1.6;text-align:center;margin-bottom:12px;font-size:9px;">"${d.resume}"</div>`:''}
      ${d.exps.length?sectionTitle('Expérience','#b45309','underline')+d.exps.map(expBlock).join(''):''}
      ${d.edus.length?sectionTitle('Formation','#b45309','underline')+d.edus.map(eduBlock).join(''):''}
      ${d.skills?sectionTitle('Compétences','#b45309','underline')+skillPills(d.skills,'#b45309'):''}
      ${stampSign(d)}</div>`,},
  { id:'t15', name:'Futuriste', category:'Moderne', preview:'🚀',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:9px;color:#e2e8f0;background:linear-gradient(135deg,#0f172a,#1e293b);padding:20px;border-radius:12px;">
      <div style="display:flex;align-items:center;margin-bottom:14px;">${photoCircle(d.photo,50,'margin-right:12px;border:2px solid #3b82f6;')}<div><div style="font-size:22px;font-weight:900;color:#60a5fa;">${d.nom||'Nom'}</div><div style="font-size:10px;color:#94a3b8;">${d.titre||'Titre'}</div></div></div>
      <div style="font-size:8px;color:#64748b;margin-bottom:10px;">${[d.tel,d.email,d.ville,d.linkedin].filter(Boolean).join(' · ')}</div>
      ${d.resume?`<div style="background:#1e293b;padding:10px;border-radius:8px;border:1px solid #334155;margin-bottom:10px;font-size:9px;color:#94a3b8;line-height:1.5;">${d.resume}</div>`:''}
      ${d.exps.length?`<div style="color:#60a5fa;font-size:9px;font-weight:bold;margin-bottom:4px;">▸ EXPÉRIENCE</div>${d.exps.map(e=>`<div style="margin-bottom:6px;padding-left:10px;border-left:2px solid #3b82f6;"><div style="font-weight:bold;color:#f1f5f9;">${e.poste}</div><div style="font-size:8px;color:#64748b;">${e.entreprise} · ${e.debut}—${e.fin||'Présent'}</div></div>`).join('')}`:''}
      ${d.skills?`<div style="color:#60a5fa;font-size:9px;font-weight:bold;margin:8px 0 4px;">▸ TECH STACK</div>${skillPills(d.skills,'#3b82f6')}`:''}
      ${stampSign(d)}</div>`,},
  // ── 16. SPLIT HORIZONTAL ──
  { id:'t16', name:'Split Horizontal', category:'Moderne', preview:'🔲',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:10px;color:#1e293b;">
      <div style="background:#0f172a;color:#fff;padding:20px;display:flex;align-items:center;gap:14px;">
        ${photoCircle(d.photo,60,'border:3px solid #3b82f6;')}
        <div style="flex:1;"><div style="font-size:24px;font-weight:900;">${d.nom||'Nom'}</div><div style="font-size:12px;color:#94a3b8;">${d.titre||'Titre'}</div></div>
        <div style="text-align:right;font-size:9px;color:#94a3b8;">${d.tel?d.tel+'<br/>':''}${d.email?d.email+'<br/>':''}${d.ville||''} ${d.pays||''}</div>
      </div>
      ${d.resume?`<div style="padding:14px 20px;background:#f1f5f9;font-size:10px;color:#475569;line-height:1.6;">${d.resume}</div>`:''}
      <div style="padding:16px 20px;">
        ${d.exps.length?sectionTitle('Expériences','#0f172a','side')+d.exps.map(expBlock).join(''):''}
        ${d.edus.length?sectionTitle('Formation','#0f172a','side')+d.edus.map(eduBlock).join(''):''}
        <div style="display:flex;gap:16px;">
          <div style="flex:1;">${d.skills?sectionTitle('Compétences','#0f172a','side')+skillPills(d.skills,'#0f172a'):''}</div>
          <div style="flex:1;">${d.langues?sectionTitle('Langues','#0f172a','side')+d.langues.split(',').map(l=>'<div style="font-size:10px;margin-bottom:3px;">• '+l.trim()+'</div>').join(''):''}</div>
        </div>
        ${d.projs.length?sectionTitle('Projets','#0f172a','side')+d.projs.map(p=>`<div style="margin-bottom:6px;"><b>${p.nom}</b> — <span style="color:#888;">${p.technologies}</span><div style="font-size:9px;color:#666;">${p.description}</div></div>`).join(''):''}
        ${d.refs.length?sectionTitle('Références','#0f172a','side')+d.refs.map(r=>`<div style="font-size:9px;margin-bottom:2px;">${r.nom} · ${r.poste} · ${r.tel}</div>`).join(''):''}
        ${stampSign(d)}
      </div></div>`},

  // ── 17. GRID CARDS ──
  { id:'t17', name:'Grille', category:'Startup', preview:'🧩',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:10px;color:#1e293b;padding:16px;background:#f8fafc;">
      <div style="text-align:center;margin-bottom:12px;">${photoCircle(d.photo,55,'display:block;margin:0 auto 6px;border:2px solid #16a34a;')}
        <div style="font-size:22px;font-weight:900;color:#16a34a;">${d.nom||'Nom'}</div>
        <div style="font-size:11px;color:#666;">${d.titre}</div>
        <div style="font-size:9px;color:#aaa;margin-top:3px;">${[d.tel,d.email,d.linkedin,d.facebook,d.youtube].filter(Boolean).join(' · ')}</div>
      </div>
      ${d.resume?`<div style="background:#fff;border-radius:10px;padding:12px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.08);font-size:10px;color:#555;line-height:1.5;">${d.resume}</div>`:''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        ${d.exps.length?`<div style="background:#fff;border-radius:10px;padding:12px;box-shadow:0 1px 2px rgba(0,0,0,0.06);grid-column:span 2;"><div style="font-weight:900;color:#16a34a;font-size:10px;margin-bottom:6px;">💼 Expériences</div>${d.exps.map(expBlock).join('')}</div>`:''}
        ${d.edus.length?`<div style="background:#fff;border-radius:10px;padding:12px;box-shadow:0 1px 2px rgba(0,0,0,0.06);"><div style="font-weight:900;color:#16a34a;font-size:10px;margin-bottom:6px;">🎓 Formation</div>${d.edus.map(eduBlock).join('')}</div>`:''}
        ${d.skills?`<div style="background:#fff;border-radius:10px;padding:12px;box-shadow:0 1px 2px rgba(0,0,0,0.06);"><div style="font-weight:900;color:#16a34a;font-size:10px;margin-bottom:6px;">🛠 Compétences</div>${skillPills(d.skills,'#16a34a')}</div>`:''}
        ${d.projs.length?`<div style="background:#fff;border-radius:10px;padding:12px;box-shadow:0 1px 2px rgba(0,0,0,0.06);grid-column:span 2;"><div style="font-weight:900;color:#16a34a;font-size:10px;margin-bottom:6px;">🚀 Projets</div>${d.projs.map(p=>`<div style="margin-bottom:4px;"><b>${p.nom}</b><div style="font-size:9px;color:#888;">${p.description}</div></div>`).join('')}</div>`:''}
      </div>${stampSign(d)}
    </div>`},

  // ── 18. EUROPEAN ──
  { id:'t18', name:'Européen', category:'International', preview:'🇪🇺',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:10px;color:#1e293b;padding:20px;">
      <table style="width:100%;margin-bottom:14px;" cellpadding="0" cellspacing="0"><tr>
        <td style="width:120px;vertical-align:top;">${photoSquare(d.photo,100)}<div style="font-size:9px;color:#888;margin-top:6px;">${allContacts(d)}</div></td>
        <td style="vertical-align:top;padding-left:16px;"><div style="font-size:24px;font-weight:900;color:#1e40af;">${d.nom||'Nom'}</div><div style="font-size:12px;color:#666;margin-top:2px;">${d.titre}</div>${d.resume?`<div style="margin-top:8px;font-size:10px;color:#555;line-height:1.5;border-top:1px solid #ddd;padding-top:6px;">${d.resume}</div>`:''}</td>
      </tr></table>
      ${d.exps.length?sectionTitle('EXPÉRIENCE PROFESSIONNELLE','#1e40af','underline')+d.exps.map(expBlock).join(''):''}
      ${d.edus.length?sectionTitle('FORMATION','#1e40af','underline')+d.edus.map(eduBlock).join(''):''}
      ${d.skills?sectionTitle('COMPÉTENCES','#1e40af','underline')+`<div style="font-size:10px;">${d.skills}</div>`:''}
      ${d.langues?sectionTitle('LANGUES','#1e40af','underline')+`<div style="font-size:10px;">${d.langues}</div>`:''}
      ${d.certs.length?sectionTitle('CERTIFICATIONS','#1e40af','underline')+d.certs.map(c=>`<div style="font-size:9px;margin-bottom:2px;">• ${c.nom} — ${c.organisme} (${c.date})</div>`).join(''):''}
      ${d.refs.length?sectionTitle('RÉFÉRENCES','#1e40af','underline')+d.refs.map(r=>`<div style="font-size:9px;margin-bottom:2px;">${r.nom} · ${r.poste} · ${r.tel}</div>`).join(''):''}
      ${stampSign(d)}</div>`},

  // ── 19. ACCENT BAR ──
  { id:'t19', name:'Barre Accent', category:'Professionnel', preview:'🎨',
    render: d => `<div style="width:520px;display:flex;font-family:Helvetica,sans-serif;font-size:10px;color:#1e293b;">
      <div style="width:6px;background:linear-gradient(180deg,#be185d,#db2777,#f472b6);"></div>
      <div style="flex:1;padding:20px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #fce7f3;">
          ${photoCircle(d.photo,55,'border:2px solid #be185d;')}
          <div><div style="font-size:22px;font-weight:900;color:#be185d;">${d.nom||'Nom'}</div><div style="font-size:11px;color:#666;">${d.titre}</div><div style="font-size:9px;color:#aaa;margin-top:3px;">${[d.tel,d.email,d.ville,d.linkedin].filter(Boolean).join(' · ')}</div></div>
        </div>
        ${d.resume?`<div style="background:#fdf2f8;padding:10px;border-radius:8px;margin-bottom:12px;font-size:10px;color:#555;line-height:1.5;">${d.resume}</div>`:''}
        ${d.exps.length?sectionTitle('Expériences','#be185d','dot')+d.exps.map(expBlock).join(''):''}
        ${d.edus.length?sectionTitle('Formation','#be185d','dot')+d.edus.map(eduBlock).join(''):''}
        ${d.skills?sectionTitle('Compétences','#be185d','dot')+skillBars(d.skills,'#be185d'):''}
        ${d.langues?sectionTitle('Langues','#be185d','dot')+d.langues.split(',').map(l=>`<div style="font-size:10px;margin-bottom:3px;">• ${l.trim()}</div>`).join(''):''}
        ${d.projs.length?sectionTitle('Projets','#be185d','dot')+d.projs.map(p=>`<div style="margin-bottom:5px;"><b>${p.nom}</b><div style="font-size:9px;color:#888;">${p.description}</div></div>`).join(''):''}
        ${stampSign(d)}
      </div></div>`},

  // ── 20. COMPACT ROWS ──
  { id:'t20', name:'Compact', category:'ATS', preview:'📑',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:10px;color:#1e293b;padding:18px;">
      <div style="font-size:26px;font-weight:900;color:#1e293b;">${d.nom||'Nom'}</div>
      <div style="font-size:12px;color:#666;margin-bottom:4px;">${d.titre}</div>
      <div style="font-size:9px;color:#999;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #1e293b;">${[d.tel,d.email,d.ville,d.linkedin,d.github,d.portfolio,d.facebook,d.youtube].filter(Boolean).join(' | ')}</div>
      ${d.resume?`<div style="font-size:10px;color:#555;line-height:1.5;margin-bottom:12px;">${d.resume}</div>`:''}
      ${d.exps.length?`<div style="font-weight:900;font-size:11px;text-transform:uppercase;color:#1e293b;margin-bottom:6px;border-bottom:1px solid #e2e8f0;padding-bottom:3px;">Expériences</div>${d.exps.map(e=>`<div style="display:flex;margin-bottom:6px;"><div style="width:90px;font-size:9px;color:#aaa;flex-shrink:0;">${e.debut}<br/>${e.fin||'Présent'}</div><div style="flex:1;"><b>${e.poste}</b> — ${e.entreprise}${e.description?`<div style="font-size:9px;color:#666;margin-top:1px;">${e.description}</div>`:''}</div></div>`).join('')}`:''}
      ${d.edus.length?`<div style="font-weight:900;font-size:11px;text-transform:uppercase;color:#1e293b;margin:10px 0 6px;border-bottom:1px solid #e2e8f0;padding-bottom:3px;">Formation</div>${d.edus.map(e=>`<div style="display:flex;margin-bottom:4px;"><div style="width:90px;font-size:9px;color:#aaa;">${e.debut}</div><div><b>${e.diplome}</b> — ${e.etablissement}</div></div>`).join('')}`:''}
      ${d.skills?`<div style="font-weight:900;font-size:11px;text-transform:uppercase;color:#1e293b;margin:10px 0 4px;border-bottom:1px solid #e2e8f0;padding-bottom:3px;">Compétences</div><div style="font-size:10px;line-height:1.6;">${d.skills}</div>`:''}
      ${stampSign(d)}</div>`},

  // ── 21. CV Moderne Bandeau Haut (Turquoise) ──
  { id:'t21', name:'Bandeau Turquoise', category:'Moderne', preview:'🌊',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:10px;color:#1e293b;">
      <div style="background:#00B7C2;padding:20px;display:flex;align-items:center;gap:15px;color:#fff;">
        ${photoCircle(d.photo, 70, 'border:3px solid #fff;')}
        <div style="flex:1;"><div style="font-size:24px;font-weight:900;">${d.nom||'Nom'}</div><div style="font-size:12px;opacity:0.9;">${d.titre||'Titre'}</div></div>
      </div>
      <div style="display:flex;">
        <div style="width:170px;background:#1e293b;color:#fff;padding:15px 10px;min-height:600px;">
          ${sectionTitle('Contact','#00B7C2')}${allContacts(d)}
          ${d.skills?sectionTitle('Compétences','#00B7C2'):''}${skillBars(d.skills,'#00B7C2')}
          ${d.langues?sectionTitle('Langues','#00B7C2'):''}${d.langues?d.langues.split(',').map(l=>`<div style="font-size:9px;margin-bottom:3px;">• ${l.trim()}</div>`).join(''):''}
        </div>
        <div style="flex:1;padding:15px;">
          ${d.resume?sectionTitle('Profil','#00B7C2','side')+`<div style="font-size:10px;color:#555;line-height:1.5;">${d.resume}</div>`:''}
          ${d.exps.length?sectionTitle('Expériences','#00B7C2','side')+d.exps.map(expBlock).join(''):''}
          ${d.edus.length?sectionTitle('Formation','#00B7C2','side')+d.edus.map(eduBlock).join(''):''}
          ${stampSign(d)}
        </div>
      </div></div>`},

  // ── 22. CV Professionnel Sidebar Bleu Nuit ──
  { id:'t22', name:'Sidebar Bleu Nuit', category:'Corporate', preview:'🌑',
    render: d => `<div style="width:520px;display:flex;font-family:Helvetica,sans-serif;font-size:10px;color:#1e293b;">
      <div style="width:180px;background:#273248;color:#fff;padding:20px 12px;text-align:center;">
        ${photoCircle(d.photo, 80, 'border:3px solid #fff;margin:0 auto 15px;')}
        <div style="font-size:16px;font-weight:900;margin-bottom:5px;">${d.nom||'Nom'}</div>
        <div style="font-size:10px;color:#94a3b8;margin-bottom:15px;">${d.titre||'Titre'}</div>
        ${allContacts(d)}
        ${d.skills?sectionTitle('Compétences','#00B7C2'):''}${skillDots(d.skills,'#fff')}
        ${d.langues?sectionTitle('Langues','#00B7C2'):''}${d.langues?d.langues.split(',').map(l=>`<div style="font-size:9px;margin-bottom:3px;">• ${l.trim()}</div>`).join(''):''}
      </div>
      <div style="flex:1;padding:20px;">
        ${d.resume?sectionTitle('Profil','#273248','underline')+`<div style="font-size:10px;color:#555;line-height:1.5;">${d.resume}</div>`:''}
        ${d.exps.length?sectionTitle('Expériences','#273248','underline')+d.exps.map(expBlock).join(''):''}
        ${d.edus.length?sectionTitle('Formation','#273248','underline')+d.edus.map(eduBlock).join(''):''}
        ${stampSign(d)}
      </div></div>`},

  // ── 23. CV Élégant Courbes Modernes ──
  { id:'t23', name:'Courbes Élégantes', category:'Élégant', preview:'🌸',
    render: d => `<div style="width:520px;display:flex;font-family:'Helvetica Neue',sans-serif;font-size:10px;color:#1e293b;background:#f8fafc;">
      <div style="width:170px;background:#f1f5f9;padding:20px 10px;border-radius:0 20px 20px 0;">
        ${photoCircle(d.photo, 70, 'border:3px solid #00B7C2;margin:0 auto 15px;display:block;')}
        ${sectionTitle('Infos','#00B7C2','dot')}${allContacts(d)}
        ${d.skills?sectionTitle('Compétences','#00B7C2','dot'):''}${skillPills(d.skills,'#00B7C2')}
      </div>
      <div style="flex:1;padding:20px;background:#fff;margin:10px;border-radius:20px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
        <div style="font-size:22px;font-weight:300;color:#00B7C2;margin-bottom:5px;">${d.nom||'Nom'}</div>
        <div style="font-size:12px;color:#666;margin-bottom:15px;border-bottom:1px solid #eee;padding-bottom:10px;">${d.titre||'Titre'}</div>
        ${d.resume?`<div style="font-style:italic;color:#555;margin-bottom:15px;">${d.resume}</div>`:''}
        ${d.exps.length?sectionTitle('Expériences','#00B7C2','dot')+d.exps.map(expBlock).join(''):''}
        ${d.edus.length?sectionTitle('Formation','#00B7C2','dot')+d.edus.map(eduBlock).join(''):''}
        ${stampSign(d)}
      </div></div>`},

  // ── 24. CV Ultra Moderne Black & Gold ──
  { id:'t24', name:'Black & Gold', category:'Luxe', preview:'👑',
    render: d => `<div style="width:520px;font-family:Georgia,serif;font-size:10px;color:#1e293b;border:1px solid #d4af37;padding:20px;">
      <div style="text-align:center;border-bottom:2px solid #d4af37;padding-bottom:15px;margin-bottom:15px;">
        <div style="font-size:26px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">${d.nom||'Nom'}</div>
        <div style="font-size:12px;color:#d4af37;letter-spacing:1px;margin-top:5px;">${d.titre||'Titre'}</div>
      </div>
      <div style="display:flex;gap:20px;">
        <div style="width:150px;border-right:1px solid #eee;padding-right:15px;">
          ${allContacts(d)}
          ${d.skills?`<div style="margin-top:15px;font-weight:bold;border-bottom:1px solid #d4af37;margin-bottom:5px;">COMPÉTENCES</div><div style="font-size:9px;">${d.skills}</div>`:''}
        </div>
        <div style="flex:1;">
          ${d.resume?`<div style="margin-bottom:15px;">${d.resume}</div>`:''}
          ${d.exps.length?`<div style="font-weight:bold;border-bottom:1px solid #d4af37;margin-bottom:5px;">EXPÉRIENCES</div>${d.exps.map(expBlock).join('')}`:''}
          ${d.edus.length?`<div style="font-weight:bold;border-bottom:1px solid #d4af37;margin:10px 0 5px;">FORMATION</div>${d.edus.map(eduBlock).join('')}`:''}
        </div>
      </div>
      ${stampSign(d)}</div>`},

  // ── 25. CV Créatif Gradient Futuriste ──
  { id:'t25', name:'Gradient Futuriste', category:'Créatif', preview:'🚀',
    render: d => `<div style="width:520px;font-family:Helvetica,sans-serif;font-size:10px;color:#1e293b;background:#f8fafc;padding:15px;">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;border-radius:15px;color:#fff;display:flex;align-items:center;gap:15px;margin-bottom:15px;box-shadow:0 10px 15px -3px rgba(118,75,162,0.3);">
        ${photoCircle(d.photo, 70, 'border:3px solid #fff;box-shadow:0 0 15px rgba(255,255,255,0.5);')}
        <div><div style="font-size:22px;font-weight:900;">${d.nom||'Nom'}</div><div style="font-size:12px;opacity:0.9;">${d.titre||'Titre'}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
        <div style="background:#fff;padding:15px;border-radius:15px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          ${sectionTitle('Profil','#764ba2','dot')}${d.resume?`<div style="font-size:10px;color:#555;">${d.resume}</div>`:''}
        </div>
        <div style="background:#fff;padding:15px;border-radius:15px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          ${sectionTitle('Compétences','#764ba2','dot')}${skillPills(d.skills,'#764ba2')}
        </div>
      </div>
      <div style="background:#fff;padding:15px;border-radius:15px;box-shadow:0 4px 6px rgba(0,0,0,0.05);margin-top:15px;">
        ${sectionTitle('Expériences','#764ba2','dot')}${d.exps.map(expBlock).join('')}
      </div>
      ${stampSign(d)}</div>`},
];

CV_TEMPLATES.push(...moreTemplates);
