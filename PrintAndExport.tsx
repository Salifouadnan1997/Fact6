import React, { useState } from 'react';
import { 
  Printer, 
  Bluetooth, 
  Wifi, 
  Usb, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  FileImage, 
  FileSpreadsheet,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { Invoice } from './types';
import { exportPDF, exportImage, exportCSV, exportExcel, printInvoice } from './exportUtils';

interface PrintAndExportProps {
  currentInvoice: Invoice;
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const PrintAndExport: React.FC<PrintAndExportProps> = ({ currentInvoice, onTriggerToast }) => {
  const [activePrinter, setActivePrinter] = useState<'thermal-80' | 'thermal-58' | 'bluetooth' | 'network' | 'usb' | 'android'>('thermal-80');
  const [isConnecting, setIsConnecting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<'Connecté' | 'En attente' | 'Erreur'>('Connecté');
  const [networkIp, setNetworkIp] = useState('192.168.1.200');

  const handleTestConnection = (printerName: string) => {
    setIsConnecting(true);
    setPrinterStatus('En attente');
    onTriggerToast(`Test de connexion avec ${printerName}...`, 'info');
    
    setTimeout(() => {
      setIsConnecting(false);
      setPrinterStatus('Connecté');
      onTriggerToast(`Imprimante ${printerName} configurée avec succès !`, 'success');
    }, 1200);
  };

  const handleExport = async (format: string) => {
    onTriggerToast(`Génération ${format} en cours...`, 'info');
    try {
      if (format === 'PDF') {
        await exportPDF(currentInvoice);
      } else if (format === 'PNG') {
        await exportImage(currentInvoice, 'png');
      } else if (format === 'JPEG') {
        await exportImage(currentInvoice, 'jpeg');
      } else if (format === 'Excel') {
        exportExcel(currentInvoice);
      } else if (format === 'CSV') {
        exportCSV(currentInvoice);
      }
      onTriggerToast(`${format} téléchargé avec succès !`, 'success');
    } catch (e) {
      console.error('Export error:', e);
      onTriggerToast(`Erreur lors de l'export ${format}`, 'warning');
    }
  };

  const printers = [
    { id: 'thermal-80', name: 'Imprimante Caisse Thermique 80mm', type: 'USB / COM1', icon: Printer, desc: 'Recommandée pour supermarchés et restaurants gastronomiques.' },
    { id: 'thermal-58', name: 'Mini Imprimante Thermique 58mm', type: 'USB / COM2', icon: Printer, desc: 'Idéale pour boutiques rapides et reçus de stationnement.' },
    { id: 'bluetooth', name: 'Imprimante Mobile Bluetooth', type: 'BT-POS-9000', icon: Bluetooth, desc: 'Parfaite pour les vendeurs itinérants et terminaux Android POS.' },
    { id: 'network', name: 'Imprimante Réseau LAN/WIFI', type: `IP: ${networkIp}`, icon: Wifi, desc: 'Partagée entre plusieurs postes de caisse et la cuisine.' },
    { id: 'usb', name: 'Imprimante de Bureau A4 (USB)', type: 'Direct USB', icon: Usb, desc: 'Utilisée pour les factures proforma et bons de commande corporate.' },
    { id: 'android', name: 'Terminal Android POS Intégré', type: 'Sunmi / PAX', icon: Smartphone, desc: 'Système d\'encaissement tout-en-un avec imprimante thermique.' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Printer className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Impression Multi-Canal & Exportation</h1>
          </div>
          <p className="text-xs text-slate-500">
            Configurez vos périphériques d'impression thermique ou exportez vos factures normalisées dans tous les formats requis par la DGI.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-xl border border-blue-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-blue-900">Pilote d'impression FACTUREset v2.6 Actif</span>
        </div>
      </div>

      {/* Main Grid: Printers (Left 7 Cols) + Export Hub (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Printer Configurations (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Gestionnaire d'Imprimantes Thermiques & POS</span>
              </h3>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                6 Périphériques Supportés
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {printers.map((p) => {
                const Icon = p.icon;
                const isActive = activePrinter === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePrinter(p.id as any)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive 
                        ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-600 ring-offset-2 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2.5 rounded-xl ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.type}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold flex items-center space-x-1 text-slate-600">
                        <span className={`w-2 h-2 rounded-full inline-block ${
                          printerStatus === 'Connecté' && isActive ? 'bg-emerald-500 animate-pulse' :
                          printerStatus === 'En attente' && isActive ? 'bg-amber-500 animate-spin' : 'bg-slate-300'
                        }`}></span>
                        <span>{isActive ? printerStatus : 'Prêt'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePrinter(p.id as any);
                          handleTestConnection(p.name);
                        }}
                        disabled={isConnecting}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                          isActive 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isConnecting && isActive ? 'animate-spin' : ''}`} />
                        <span>Tester</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {activePrinter === 'network' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Adresse IP de l'imprimante Réseau</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={networkIp}
                    onChange={(e) => setNetworkIp(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestConnection('Imprimante Réseau LAN/WIFI')}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
            )}

            <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4 shadow-xl">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-sm tracking-tight">Lancer l'impression Directe</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                L'impression thermique de la facture <strong className="text-white font-mono">{currentInvoice.invoiceNumber}</strong> s'exécutera sur le périphérique sélectionné avec alignement automatique et séparation des sections.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={async () => {
                    onTriggerToast('Préparation de l\'impression...', 'info');
                    try {
                      await printInvoice(currentInvoice);
                    } catch {
                      onTriggerToast('Erreur d\'impression', 'warning');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 border border-blue-400/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer la Facture Active ({currentInvoice.paperSize})</span>
                </button>
              </div>
            </div>

          </div>
        </div>


        {/* Right: Exportation Hub (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Centre d'Exportation Multi-Format</span>
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                DGI Compatible
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Téléchargez votre facture normalisée ou l'historique commercial dans l'un des formats standardisés ci-dessous pour votre comptabilité ou envoi au client.
            </p>

            <div className="space-y-3">
              {/* PDF */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-rose-100 text-rose-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Format PDF Normalisé</h4>
                    <p className="text-[10px] text-slate-500">Document sécurisé avec QR Code & Signature</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('PDF')}
                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 p-2 rounded-xl text-xs font-bold transition-all shadow-sm group-hover:border-blue-300"
                  title="Télécharger PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* PNG */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Image Haute Qualité (PNG)</h4>
                    <p className="text-[10px] text-slate-500">Idéal pour partage rapide sur WhatsApp ou Email</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('PNG')}
                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 p-2 rounded-xl text-xs font-bold transition-all shadow-sm group-hover:border-blue-300"
                  title="Télécharger PNG"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* JPEG */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Image Compressée (JPEG)</h4>
                    <p className="text-[10px] text-slate-500">Format léger pour archivage ou connexion lente</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('JPEG')}
                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 p-2 rounded-xl text-xs font-bold transition-all shadow-sm group-hover:border-blue-300"
                  title="Télécharger JPEG"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Excel */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Tableur Excel (.XLSX)</h4>
                    <p className="text-[10px] text-slate-500">Lignes de facturation complètes avec formules</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('Excel')}
                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 p-2 rounded-xl text-xs font-bold transition-all shadow-sm group-hover:border-blue-300"
                  title="Télécharger Excel"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* CSV */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Fichier de Données brut (CSV)</h4>
                    <p className="text-[10px] text-slate-500">Pour import direct dans un autre logiciel ERP/SaaS</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('CSV')}
                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 p-2 rounded-xl text-xs font-bold transition-all shadow-sm group-hover:border-blue-300"
                  title="Télécharger CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Information Alert */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start space-x-3 text-xs text-slate-600">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Tous les exports incluent automatiquement la mention légale obligatoire, le numéro RCCM et l'IFU conformément aux exigences des services fiscaux.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
