import { Template, Product, Category, Supplier, Client, Expense, Caisse, User, Report, AIAnalytics, Invoice } from './types';

export const INITIAL_TEMPLATES: Template[] = [
  // Moderne
  { id: 'tpl-1', name: 'Moderne Épuré', category: 'Moderne', styleDescription: 'Design clair avec lignes séparatrices nettes et en-tête structuré', paperSize: '80mm', primaryColor: '#2563eb', fontFamily: 'font-sans' },
  { id: 'tpl-2', name: 'Moderne Compact', category: 'Moderne', styleDescription: 'Optimisé pour une lecture rapide des montants et QR code mis en valeur', paperSize: '58mm', primaryColor: '#1d4ed8', fontFamily: 'font-sans' },
  { id: 'tpl-3', name: 'Moderne A4 Pro', category: 'Moderne', styleDescription: 'Format A4 complet avec colonnes détaillées et encadré fiscal', paperSize: 'A4', primaryColor: '#1e40af', fontFamily: 'font-sans' },
  
  // Minimaliste
  { id: 'tpl-4', name: 'Minimaliste Monochrome', category: 'Minimaliste', styleDescription: 'Zéro fioriture, accent sur la clarté et l\'économie d\'encre', paperSize: '58mm', primaryColor: '#18181b', fontFamily: 'font-mono' },
  { id: 'tpl-5', name: 'Minimaliste Léger', category: 'Minimaliste', styleDescription: 'Typographie fine, espacement généreux et bordures discrètes', paperSize: '80mm', primaryColor: '#27272a', fontFamily: 'font-sans' },
  { id: 'tpl-6', name: 'Minimaliste Élégant', category: 'Minimaliste', styleDescription: 'Idéal pour bons de commande rapides et reçus de paiement simples', paperSize: 'A4', primaryColor: '#3f3f46', fontFamily: 'font-serif' },

  // Supermarché
  { id: 'tpl-7', name: 'Supermarché Express', category: 'Supermarché', styleDescription: 'Ticket de caisse classique haute vitesse avec total en gros caractères', paperSize: '58mm', primaryColor: '#059669', fontFamily: 'font-mono' },
  { id: 'tpl-8', name: 'Supermarché Hyper', category: 'Supermarché', styleDescription: 'Affichage des remises par article et récapitulatif de fidélité', paperSize: '80mm', primaryColor: '#10b981', fontFamily: 'font-mono' },
  { id: 'tpl-9', name: 'Supermarché Gros Volume', category: 'Supermarché', styleDescription: 'Conçu pour les chariots pleins avec sous-totaux par rayon', paperSize: '80mm', primaryColor: '#047857', fontFamily: 'font-sans' },

  // Restaurant
  { id: 'tpl-10', name: 'Restaurant Bistrot', category: 'Restaurant', styleDescription: 'Mention de la table, du serveur et répartition des couverts', paperSize: '80mm', primaryColor: '#b91c1c', fontFamily: 'font-serif' },
  { id: 'tpl-11', name: 'Restaurant Gourmet', category: 'Restaurant', styleDescription: 'Présentation raffinée avec section pourboire et message de courtoisie', paperSize: '80mm', primaryColor: '#991b1b', fontFamily: 'font-serif' },
  { id: 'tpl-12', name: 'Restaurant Fast-Food', category: 'Restaurant', styleDescription: 'Numéro de commande en très gros pour appel au comptoir', paperSize: '58mm', primaryColor: '#dc2626', fontFamily: 'font-sans' },

  // Boutique
  { id: 'tpl-13', name: 'Boutique Charme', category: 'Boutique', styleDescription: 'Mise en avant des conditions d\'échange et de la politique de retour', paperSize: '80mm', primaryColor: '#db2777', fontFamily: 'font-sans' },
  { id: 'tpl-14', name: 'Boutique Concept', category: 'Boutique', styleDescription: 'Style avant-gardiste avec alignement asymétrique des totaux', paperSize: '58mm', primaryColor: '#be185d', fontFamily: 'font-mono' },
  { id: 'tpl-15', name: 'Boutique Premium', category: 'Boutique', styleDescription: 'Format A4 luxueux pour produits de haute valeur avec garantie', paperSize: 'A4', primaryColor: '#9d174d', fontFamily: 'font-serif' },

  // Pharmacie
  { id: 'tpl-16', name: 'Pharmacie Santé', category: 'Pharmacie', styleDescription: 'Caducée en en-tête, colonnes part mutuelle et part patient', paperSize: '80mm', primaryColor: '#0d9488', fontFamily: 'font-sans' },
  { id: 'tpl-17', name: 'Pharmacie Garde', category: 'Pharmacie', styleDescription: 'Ticket d\'urgence avec mention des numéros de secours', paperSize: '58mm', primaryColor: '#0f766e', fontFamily: 'font-mono' },
  { id: 'tpl-18', name: 'Pharmacie Clinique', category: 'Pharmacie', styleDescription: 'Détail complet des lots et dates d\'expiration pour traçabilité', paperSize: 'A4', primaryColor: '#115e59', fontFamily: 'font-sans' },

  // Poissonnerie
  { id: 'tpl-19', name: 'Poissonnerie Océan', category: 'Poissonnerie', styleDescription: 'Mentions zone de pêche et fraîcheur garanties en évidence', paperSize: '80mm', primaryColor: '#0284c7', fontFamily: 'font-mono' },
  { id: 'tpl-20', name: 'Poissonnerie Marée', category: 'Poissonnerie', styleDescription: 'Format compact résistant aux manipulations rapides au comptoir', paperSize: '58mm', primaryColor: '#0369a1', fontFamily: 'font-sans' },
  { id: 'tpl-21', name: 'Poissonnerie Criée', category: 'Poissonnerie', styleDescription: 'Reçu de gros pour restaurateurs et revendeurs avec tare', paperSize: 'A4', primaryColor: '#075985', fontFamily: 'font-serif' },

  // Électronique
  { id: 'tpl-22', name: 'Électronique Tech', category: 'Électronique', styleDescription: 'Numéros de série et clauses de garantie constructeur intégrés', paperSize: '80mm', primaryColor: '#4f46e5', fontFamily: 'font-mono' },
  { id: 'tpl-23', name: 'Électronique Mobile', category: 'Électronique', styleDescription: 'Ticket de réparation ou vente d\'accessoires avec code IMEI', paperSize: '58mm', primaryColor: '#4338ca', fontFamily: 'font-sans' },
  { id: 'tpl-24', name: 'Électronique B2B', category: 'Électronique', styleDescription: 'Facture A4 professionnelle avec conditions de paiement à 30 jours', paperSize: 'A4', primaryColor: '#3730a3', fontFamily: 'font-sans' },

  // Fashion
  { id: 'tpl-25', name: 'Fashion Couture', category: 'Fashion', styleDescription: 'Design haute couture avec polices élégantes et logo centré', paperSize: '80mm', primaryColor: '#9333ea', fontFamily: 'font-serif' },
  { id: 'tpl-26', name: 'Fashion Streetwear', category: 'Fashion', styleDescription: 'Look brut et urbain avec QR code vers le catalogue Instagram', paperSize: '58mm', primaryColor: '#7e22ce', fontFamily: 'font-mono' },
  { id: 'tpl-27', name: 'Fashion Showroom', category: 'Fashion', styleDescription: 'Bon de commande A4 pour essayages et retouches sur mesure', paperSize: 'A4', primaryColor: '#6b21a8', fontFamily: 'font-sans' },

  // Corporate
  { id: 'tpl-28', name: 'Corporate Executive', category: 'Corporate', styleDescription: 'Facture formelle A4 pour services de conseil et prestations B2B', paperSize: 'A4', primaryColor: '#475569', fontFamily: 'font-sans' },
  { id: 'tpl-29', name: 'Corporate Consulting', category: 'Corporate', styleDescription: 'Tableau des taux horaires et relevé d\'heures de mission', paperSize: 'A4', primaryColor: '#334155', fontFamily: 'font-serif' },
  { id: 'tpl-30', name: 'Corporate Ticket', category: 'Corporate', styleDescription: 'Note de frais thermique instantanée pour déplacements officiels', paperSize: '80mm', primaryColor: '#1e293b', fontFamily: 'font-mono' },

  // ═══ QUITTANCES DE LOYER ═══
  { id: 'tpl-31', name: 'Quittance Loyer Standard', category: 'Quittance Loyer', styleDescription: 'Quittance de loyer mensuelle avec détails du bail et montant', paperSize: 'A4', primaryColor: '#0d9488', fontFamily: 'font-sans' },
  { id: 'tpl-32', name: 'Quittance Loyer Commercial', category: 'Quittance Loyer', styleDescription: 'Bail commercial avec charges locatives détaillées et TVA', paperSize: 'A4', primaryColor: '#0f766e', fontFamily: 'font-serif' },
  { id: 'tpl-33', name: 'Quittance Loyer Résidentiel', category: 'Quittance Loyer', styleDescription: 'Logement résidentiel avec eau, électricité et ordures ménagères', paperSize: 'A4', primaryColor: '#115e59', fontFamily: 'font-sans' },
  { id: 'tpl-34', name: 'Quittance Loyer Compact', category: 'Quittance Loyer', styleDescription: 'Format compact thermique pour quittance rapide de loyer', paperSize: '80mm', primaryColor: '#0d9488', fontFamily: 'font-mono' },

  // ═══ QUITTANCES DE SERVICE ═══
  { id: 'tpl-35', name: 'Quittance Service Ménage', category: 'Quittance Service', styleDescription: 'Reçu de paiement pour prestation de nettoyage et entretien', paperSize: 'A4', primaryColor: '#7c3aed', fontFamily: 'font-sans' },
  { id: 'tpl-36', name: 'Quittance Service Freelance', category: 'Quittance Service', styleDescription: 'Prestation intellectuelle, développement web, design graphique', paperSize: 'A4', primaryColor: '#6d28d9', fontFamily: 'font-sans' },
  { id: 'tpl-37', name: 'Quittance Service Technique', category: 'Quittance Service', styleDescription: 'Réparation, plomberie, électricité, maintenance équipement', paperSize: 'A4', primaryColor: '#5b21b6', fontFamily: 'font-mono' },
  { id: 'tpl-38', name: 'Quittance Service Événementiel', category: 'Quittance Service', styleDescription: 'Organisation événement, location salle, traiteur, DJ', paperSize: 'A4', primaryColor: '#8b5cf6', fontFamily: 'font-serif' },

  // ═══ QUITTANCES TRANSPORT ═══
  { id: 'tpl-39', name: 'Quittance Transport Taxi', category: 'Quittance Transport', styleDescription: 'Reçu de course taxi/VTC avec trajet, distance et tarif', paperSize: '58mm', primaryColor: '#eab308', fontFamily: 'font-mono' },
  { id: 'tpl-40', name: 'Quittance Transport Livraison', category: 'Quittance Transport', styleDescription: 'Bon de livraison avec poids, dimensions et adresses', paperSize: '80mm', primaryColor: '#ca8a04', fontFamily: 'font-sans' },
  { id: 'tpl-41', name: 'Quittance Transport Déménagement', category: 'Quittance Transport', styleDescription: 'Facture déménagement avec inventaire et assurance transport', paperSize: 'A4', primaryColor: '#a16207', fontFamily: 'font-sans' },
  { id: 'tpl-42', name: 'Quittance Transport Fret', category: 'Quittance Transport', styleDescription: 'Bordereau expédition marchandise, port maritime ou aérien', paperSize: 'A4', primaryColor: '#854d0e', fontFamily: 'font-serif' },

  // ═══ QUITTANCES ÉDUCATION ═══
  { id: 'tpl-43', name: 'Quittance Scolarité', category: 'Quittance Éducation', styleDescription: 'Reçu de paiement frais de scolarité avec trimestre et classe', paperSize: 'A4', primaryColor: '#2563eb', fontFamily: 'font-sans' },
  { id: 'tpl-44', name: 'Quittance Formation Pro', category: 'Quittance Éducation', styleDescription: 'Formation professionnelle, certification, séminaire payant', paperSize: 'A4', primaryColor: '#1d4ed8', fontFamily: 'font-sans' },
  { id: 'tpl-45', name: 'Quittance Cours Particulier', category: 'Quittance Éducation', styleDescription: 'Reçu pour cours à domicile, tutorat, soutien scolaire', paperSize: '80mm', primaryColor: '#1e40af', fontFamily: 'font-mono' },
  { id: 'tpl-46', name: 'Quittance Inscription Examen', category: 'Quittance Éducation', styleDescription: 'Frais d\'inscription à un concours ou examen officiel', paperSize: 'A4', primaryColor: '#3b82f6', fontFamily: 'font-serif' },

  // ═══ QUITTANCES SANTÉ ═══
  { id: 'tpl-47', name: 'Quittance Consultation Médicale', category: 'Quittance Santé', styleDescription: 'Reçu de consultation médecin, spécialiste, dentiste', paperSize: 'A4', primaryColor: '#dc2626', fontFamily: 'font-sans' },
  { id: 'tpl-48', name: 'Quittance Laboratoire Analyse', category: 'Quittance Santé', styleDescription: 'Facture analyses biologiques, radiologie, imagerie médicale', paperSize: 'A4', primaryColor: '#b91c1c', fontFamily: 'font-sans' },
  { id: 'tpl-49', name: 'Quittance Pharmacie Ordonnance', category: 'Quittance Santé', styleDescription: 'Ticket pharmacie avec détails médicaments et remboursement', paperSize: '80mm', primaryColor: '#991b1b', fontFamily: 'font-mono' },
  { id: 'tpl-50', name: 'Quittance Hospitalisation', category: 'Quittance Santé', styleDescription: 'Facture séjour hospitalier avec soins, chambre et honoraires', paperSize: 'A4', primaryColor: '#ef4444', fontFamily: 'font-serif' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Supermarché & Alimentaire', description: 'Produits de consommation courante, boissons et épicerie', itemCount: 45 },
  { id: 'cat-2', name: 'Restauration & Boissons', description: 'Plats cuisinés, menus, desserts et boissons de bar', itemCount: 32 },
  { id: 'cat-3', name: 'Pharmacie & Parapharmacie', description: 'Médicaments, premiers soins, hygiène et matériel médical', itemCount: 64 },
  { id: 'cat-4', name: 'Électronique & Informatique', description: 'Smartphones, ordinateurs, câbles et accessoires tech', itemCount: 28 },
  { id: 'cat-5', name: 'Mode & Vêtements', description: 'Prêt-à-porter, chaussures, maroquinerie et bijoux', itemCount: 51 },
  { id: 'cat-6', name: 'Poissonnerie & Frais', description: 'Poissons frais, crustacés, coquillages et plateaux', itemCount: 19 },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'AfriDistrib SA', contactName: 'Mamadou Koné', phone: '+225 01 02 03 04', email: 'contact@afridistrib.ci', address: 'Zone Industrielle Yopougon, Abidjan', productsSupplied: 42 },
  { id: 'sup-2', name: 'Global Tech Import', contactName: 'Sarah Lin', phone: '+225 05 44 33 22', email: 'import@globaltech.com', address: 'Boulevard VGE, Marcory, Abidjan', productsSupplied: 18 },
  { id: 'sup-3', name: 'PharmaGros CI', contactName: 'Dr. Jean-Marc Bédié', phone: '+225 07 88 99 00', email: 'commandes@pharmagros.ci', address: 'Cocody Riviera 3, Abidjan', productsSupplied: 64 },
  { id: 'sup-4', name: 'Marée Fraîche Express', contactName: 'Koffi Kouadio', phone: '+225 01 55 66 77', email: 'logistique@mareefraiche.ci', address: 'Port de Pêche, Treichville, Abidjan', productsSupplied: 15 },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-demo', name: 'Produit Exemple (Supprimez-moi)', categoryId: 'cat-1', categoryName: 'Divers', sku: 'DEM-001', price: 0, costPrice: 0, stock: 0, minStock: 0, supplierId: '', supplierName: '', aiPopularity: 'Faible' }
];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_CAISSES: Caisse[] = [
  { id: 'caisse-1', name: 'Caisse Principale', status: 'Ouverte', openedAt: new Date().toISOString(), initialAmount: 0, currentAmount: 0, cashierName: 'Utilisateur' }
];

export const INITIAL_USERS: User[] = [];

export const INITIAL_REPORTS: Report[] = [];

export const INITIAL_AI_ANALYTICS: AIAnalytics = {
  totalRevenue: 0,
  revenueGrowth: 0,
  totalProfit: 0,
  profitGrowth: 0,
  totalExpenses: 0,
  expenseChange: 0,
  dailySales: [],
  monthlyForecast: [],
  topProducts: [{ name: 'Produit Exemple', category: 'Divers', sales: 0, revenue: 0, status: 'Nouveau' }],
  anomalies: []
};

export const DEFAULT_INVOICE: Invoice = {
  id: 'INV-2026-0589',
  documentType: 'Facture normalisée',
  invoiceNumber: 'FA-2026-0589',
  dateTime: '15/05/2026 14:35',
  companyName: 'FACTUREset',
  rccm: 'CI-ABJ-03-2022-B14-00129',
  ifu: '001492049281A',
  address: 'Boulevard Valéry Giscard d\'Estaing, Abidjan, Côte d\'Ivoire',
  phone: '+225 01 23 45 67 89',
  logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80',
  slogan: 'L\'excellence commerciale au service de votre croissance',
  sellerName: 'Fatou Bamba (Caisse 1)',
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  clientIfu: '',
  clientRccm: '',
  items: [],
  subtotal: 0,
  vatRate: 18,
  vatAmount: 0,
  discountRate: 0,
  discountAmount: 0,
  totalAmount: 0,
  amountPaid: 0,
  reliquat: 0,
  paymentMethod: 'Espèces',
  qrCodeData: 'https://factureset.com/verify/INV-2026-0589?ifu=001492049281A&amount=141250',
  digitalSignature: 'SIG-89A4-BF72-00C1-99FE',
  legalMention: 'Facture normalisée conforme aux exigences fiscales de la DGI. En cas de retard de paiement, des pénalités de 3% seront appliquées. Les marchandises vendues ne sont ni reprises ni échangées après 48h.',
  thankYouMessage: 'Merci de votre confiance ! À très bientôt chez FACTUREset.',
  templateId: 'tpl-1',
  paperSize: '80mm',
  primaryColor: '#2563eb',
  fontFamily: 'font-sans',
  showStamp: false,
  showSignature: false,
  showLogo: true,
  showQrCode: true
};
