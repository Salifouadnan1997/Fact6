export type DocumentType = 
  | 'Facture normalisée'
  | 'Ticket thermique'
  | 'Facture PDF'
  | 'Facture A4'
  | 'Facture proforma'
  | 'Reçu de paiement'
  | 'Bon de commande';

export type TemplateCategory = 
  | 'Moderne'
  | 'Minimaliste'
  | 'Supermarché'
  | 'Restaurant'
  | 'Boutique'
  | 'Pharmacie'
  | 'Poissonnerie'
  | 'Électronique'
  | 'Fashion'
  | 'Corporate'
  | 'Quittance Loyer'
  | 'Quittance Service'
  | 'Quittance Transport'
  | 'Quittance Éducation'
  | 'Quittance Santé';

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  description?: string;
  imageUrl?: string;
  weight?: string;
  color?: string;
}

export interface Invoice {
  id: string;
  documentType: DocumentType;
  invoiceNumber: string;
  dateTime: string;
  companyName: string;
  rccm: string;
  ifu: string;
  address: string;
  phone: string;
  logoUrl: string;
  slogan: string;
  sellerName: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  clientIfu?: string;
  clientRccm?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number; // percentage e.g. 18
  vatAmount: number;
  discountRate: number; // percentage
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  reliquat: number; // balance / change
  paymentMethod: 'Espèces' | 'Carte Bancaire' | 'Mobile Money' | 'Chèque' | 'Virement';
  qrCodeData: string;
  digitalSignature: string;
  legalMention: string;
  thankYouMessage: string;
  templateId: string;
  paperSize: '58mm' | '80mm' | 'A4';
  primaryColor: string;
  fontFamily: string;
  showStamp: boolean;
  showSignature: boolean;
  showLogo: boolean;
  showQrCode: boolean;
  stampImageUrl?: string;
  signatureImageUrl?: string;
  stampStyle?: 'classic' | 'round' | 'square' | 'elegant' | 'minimal';
  stampColor?: string;
  stampText?: string;
  stampPos?: { x: number; y: number };
  signaturePos?: { x: number; y: number };
  stampScale?: number;
  signatureScale?: number;
  stampRotation?: number;
  signatureRotation?: number;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  styleDescription: string;
  paperSize: '58mm' | '80mm' | 'A4';
  primaryColor: string;
  fontFamily: string;
  isCustom?: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  supplierId: string;
  supplierName: string;
  aiPopularity: 'Élevée' | 'Moyenne' | 'Faible';
  aiRecommendedPrice?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  productsSupplied: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  ifu?: string;
  rccm?: string;
  totalSpent: number;
  invoiceCount: number;
  loyaltyStatus: 'VIP' | 'Régulier' | 'Nouveau';
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  authorizedBy: string;
  notes: string;
}

export interface Caisse {
  id: string;
  name: string;
  status: 'Ouverte' | 'Fermée';
  openedAt: string;
  initialAmount: number;
  currentAmount: number;
  cashierName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrateur' | 'Gérant' | 'Caissier' | 'Comptable';
  status: 'Actif' | 'Inactif';
  permissions: string[];
}

export interface Report {
  id: string;
  title: string;
  type: 'Ventes' | 'Financier' | 'Stock' | 'TVA' | 'IA Audit';
  generatedAt: string;
  generatedBy: string;
  summary: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionType?: 'restock' | 'repricing' | 'promotion' | 'report';
  actionData?: any;
}

export interface AIAnalytics {
  totalRevenue: number;
  revenueGrowth: number;
  totalProfit: number;
  profitGrowth: number;
  totalExpenses: number;
  expenseChange: number;
  dailySales: { day: string; amount: number; forecast: number }[];
  monthlyForecast: { month: string; expectedRevenue: number; aiConfidence: number }[];
  topProducts: { name: string; category: string; sales: number; revenue: number; status: string }[];
  anomalies: { id: string; date: string; description: string; severity: 'Élevée' | 'Moyenne' | 'Faible'; status: string }[];
}
