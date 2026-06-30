// ═══════════════════════════════════════════════════════════════
// FACTUREset — Internationalization (i18n) System
// Supported: French (fr), English (en)
// ═══════════════════════════════════════════════════════════════

export type Lang = 'fr' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // ── Common ──
  'app.name': { fr: 'FACTUREset', en: 'FACTUREset' },
  'app.tagline': { fr: 'Plateforme SaaS de gestion des factures et commercial', en: 'SaaS Platform for Invoice & Business Management' },
  'app.contact': { fr: 'Besoin de solution digital? Contact:', en: 'Need a digital solution? Contact:' },
  'app.rights': { fr: '© 2026 FACTUREset — Tous droits réservés', en: '© 2026 FACTUREset — All rights reserved' },
  'btn.save': { fr: 'Enregistrer', en: 'Save' },
  'btn.cancel': { fr: 'Annuler', en: 'Cancel' },
  'btn.delete': { fr: 'Supprimer', en: 'Delete' },
  'btn.add': { fr: 'Ajouter', en: 'Add' },
  'btn.download': { fr: 'Télécharger', en: 'Download' },
  'btn.print': { fr: 'Imprimer', en: 'Print' },
  'btn.export': { fr: 'Exporter', en: 'Export' },
  'btn.import': { fr: 'Importer', en: 'Import' },
  'btn.back': { fr: 'Retour à l\'accueil', en: 'Back to Home' },
  'btn.login': { fr: 'Se connecter', en: 'Log in' },
  'btn.register': { fr: 'S\'inscrire', en: 'Sign up' },
  'btn.logout': { fr: 'Se déconnecter', en: 'Log out' },
  'btn.close': { fr: 'Fermer', en: 'Close' },

  // ── Auth ──
  'auth.title': { fr: 'Connexion sécurisée', en: 'Secure Login' },
  'auth.email': { fr: 'Adresse e-mail', en: 'Email Address' },
  'auth.password': { fr: 'Mot de passe', en: 'Password' },
  'auth.login': { fr: 'Se connecter', en: 'Log in' },
  'auth.register': { fr: 'Créer un compte', en: 'Create Account' },
  'auth.noAccount': { fr: 'Pas encore de compte ?', en: 'Don\'t have an account?' },
  'auth.hasAccount': { fr: 'Déjà un compte ?', en: 'Already have an account?' },
  'auth.createAccount': { fr: 'Créer un compte', en: 'Create an account' },
  'auth.fullName': { fr: 'Nom complet', en: 'Full name' },
  'auth.role': { fr: 'Rôle', en: 'Role' },
  'auth.confirmPwd': { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
  'auth.fillAll': { fr: 'Veuillez remplir tous les champs.', en: 'Please fill all fields.' },
  'auth.wrongCreds': { fr: 'Email ou mot de passe incorrect.', en: 'Wrong email or password.' },
  'auth.locked': { fr: 'Compte verrouillé. Réessayez dans 2 minutes.', en: 'Account locked. Retry in 2 minutes.' },
  'auth.success': { fr: 'Compte créé avec succès !', en: 'Account created successfully!' },

  // ── Navigation ──
  'nav.dashboard': { fr: 'Accueil & Dashboard IA', en: 'Home & AI Dashboard' },
  'nav.projects': { fr: 'Mes Projets', en: 'My Projects' },
  'nav.invoices': { fr: 'Générateur de Factures', en: 'Invoice Generator' },
  'nav.quittances': { fr: 'Générateur de Quittances', en: 'Receipt Generator' },
  'nav.templates': { fr: 'Modèles & Personnalisation', en: 'Templates & Customization' },
  'nav.stamps': { fr: 'Cachets & Signatures', en: 'Stamps & Signatures' },
  'nav.docsign': { fr: 'Signer un Document', en: 'Sign a Document' },
  'nav.ai': { fr: 'Assistant IA Commercial', en: 'AI Business Assistant' },
  'nav.commercial': { fr: 'Gestion Commerciale', en: 'Business Management' },
  'nav.export': { fr: 'Impression & Exportation', en: 'Print & Export' },
  'nav.wallet': { fr: 'Wallet Multidevise', en: 'Multi-currency Wallet' },
  'nav.subscription': { fr: 'Abonnement & Tarifs', en: 'Plans & Pricing' },
  'nav.affiliation': { fr: 'Affiliation — 30%', en: 'Affiliate — 30%' },
  'nav.cv': { fr: 'Générateur de CV IA', en: 'AI Resume Builder' },
  'nav.admin': { fr: 'Administration', en: 'Administration' },

  // ── Header Rotating ──
  'header.invoice': { fr: '📄 Créer Facture', en: '📄 Create Invoice' },
  'header.cv': { fr: '🤖 Créer CV', en: '🤖 Build Resume' },
  'header.quittance': { fr: '📋 Créer Quittance', en: '📋 Create Receipt' },
  'header.sign': { fr: '✍️ Signer Docs', en: '✍️ Sign Docs' },
  'header.stamps': { fr: '🔧 Cachets & Tampons', en: '🔧 Stamps & Seals' },
  'header.erp': { fr: '📊 Gestion ERP', en: '📊 ERP Management' },

  // ── Dashboard ──
  'dash.welcome': { fr: 'Bienvenue sur FACTUREset', en: 'Welcome to FACTUREset' },
  'dash.subtitle': { fr: 'Votre plateforme intelligente de gestion commerciale.', en: 'Your intelligent business management platform.' },
  'dash.quicknav': { fr: 'Menu de Navigation Rapide', en: 'Quick Navigation Menu' },
  'dash.revenue': { fr: 'Chiffre d\'Affaires Mensuel', en: 'Monthly Revenue' },
  'dash.profit': { fr: 'Bénéfices Nets Estimés', en: 'Estimated Net Profit' },
  'dash.expenses': { fr: 'Dépenses & Charges', en: 'Expenses & Charges' },

  // ── Footer ──
  'footer.about': { fr: 'À propos de nous', en: 'About Us' },
  'footer.privacy': { fr: 'Politique de confidentialité', en: 'Privacy Policy' },
  'footer.terms': { fr: 'Conditions d\'utilisation', en: 'Terms of Use' },
  'footer.contact': { fr: 'Contact', en: 'Contact' },
  'footer.help': { fr: 'Centre d\'aide', en: 'Help Center' },

  // ── About ──
  'about.title': { fr: 'À propos de FACTUREset', en: 'About FACTUREset' },
  'about.desc': { fr: 'FACTUREset est une plateforme SaaS complète de génération de factures normalisées, quittances professionnelles, signatures électroniques et gestion commerciale. Notre mission est de digitaliser et simplifier la gestion administrative des entreprises africaines et internationales.', en: 'FACTUREset is a comprehensive SaaS platform for generating standardized invoices, professional receipts, electronic signatures, and business management. Our mission is to digitize and simplify administrative management for African and international businesses.' },
  'about.mission': { fr: 'Notre Mission', en: 'Our Mission' },
  'about.missionText': { fr: 'Permettre à chaque entreprise, du micro-entrepreneur au grand groupe, d\'accéder à des outils de facturation professionnels, conformes aux normes fiscales internationales, avec l\'intelligence artificielle intégrée.', en: 'To enable every business, from micro-entrepreneurs to large corporations, to access professional invoicing tools that comply with international tax standards, with built-in artificial intelligence.' },
  'about.features': { fr: 'Nos Fonctionnalités', en: 'Our Features' },
  'about.team': { fr: 'Notre Équipe', en: 'Our Team' },
  'about.teamText': { fr: 'FACTUREset est développé par une équipe passionnée de développeurs, designers et experts en gestion commerciale basée en Afrique de l\'Ouest.', en: 'FACTUREset is developed by a passionate team of developers, designers, and business management experts based in West Africa.' },

  // ── Privacy ──
  'privacy.title': { fr: 'Politique de Confidentialité', en: 'Privacy Policy' },
  'privacy.intro': { fr: 'Chez FACTUREset, nous prenons la protection de vos données personnelles très au sérieux. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations.', en: 'At FACTUREset, we take the protection of your personal data very seriously. This policy describes how we collect, use, and protect your information.' },
  'privacy.collect': { fr: 'Données Collectées', en: 'Data Collected' },
  'privacy.collectText': { fr: 'Nous collectons les informations que vous fournissez lors de l\'inscription (nom, email, téléphone), les données de facturation (clients, produits, montants), et les données d\'utilisation (pages visitées, actions effectuées).', en: 'We collect information you provide during registration (name, email, phone), billing data (clients, products, amounts), and usage data (pages visited, actions performed).' },
  'privacy.use': { fr: 'Utilisation des Données', en: 'Data Usage' },
  'privacy.useText': { fr: 'Vos données sont utilisées exclusivement pour fournir nos services, améliorer l\'expérience utilisateur, générer des factures et quittances, et assurer la sécurité de votre compte.', en: 'Your data is used exclusively to provide our services, improve user experience, generate invoices and receipts, and ensure your account security.' },
  'privacy.security': { fr: 'Sécurité', en: 'Security' },
  'privacy.securityText': { fr: 'Toutes les données sont chiffrées en transit (TLS) et au repos (AES-256). Nous utilisons l\'authentification forte, le rate limiting, et les tokens CSRF pour protéger vos comptes.', en: 'All data is encrypted in transit (TLS) and at rest (AES-256). We use strong authentication, rate limiting, and CSRF tokens to protect your accounts.' },
  'privacy.rights': { fr: 'Vos Droits', en: 'Your Rights' },
  'privacy.rightsText': { fr: 'Vous avez le droit d\'accéder, de modifier, de supprimer vos données personnelles à tout moment. Contactez-nous à Salifouadnan1997@gmail.com.', en: 'You have the right to access, modify, and delete your personal data at any time. Contact us at Salifouadnan1997@gmail.com.' },

  // ── Terms ──
  'terms.title': { fr: 'Conditions d\'Utilisation', en: 'Terms of Use' },
  'terms.intro': { fr: 'En utilisant FACTUREset, vous acceptez les conditions suivantes. Veuillez les lire attentivement.', en: 'By using FACTUREset, you agree to the following terms. Please read them carefully.' },
  'terms.service': { fr: 'Description du Service', en: 'Service Description' },
  'terms.serviceText': { fr: 'FACTUREset fournit des outils de génération de factures, quittances, CV, signature électronique et gestion commerciale sous forme de service en ligne (SaaS).', en: 'FACTUREset provides invoice generation, receipts, resumes, electronic signature, and business management tools as an online service (SaaS).' },
  'terms.account': { fr: 'Comptes Utilisateurs', en: 'User Accounts' },
  'terms.accountText': { fr: 'Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité effectuée sous votre compte est votre responsabilité.', en: 'You are responsible for the confidentiality of your login credentials. All activity performed under your account is your responsibility.' },
  'terms.payment': { fr: 'Paiements & Abonnements', en: 'Payments & Subscriptions' },
  'terms.paymentText': { fr: 'Les abonnements sont facturés mensuellement via PayLiv (Mobile Money, Carte Bancaire). Les paiements sont non remboursables sauf disposition contraire de la loi.', en: 'Subscriptions are billed monthly via PayLiv (Mobile Money, Bank Card). Payments are non-refundable unless otherwise required by law.' },
  'terms.ip': { fr: 'Propriété Intellectuelle', en: 'Intellectual Property' },
  'terms.ipText': { fr: 'Tout le contenu, les designs, les templates et le code de FACTUREset sont protégés par le droit d\'auteur. Toute reproduction non autorisée est interdite.', en: 'All content, designs, templates, and code of FACTUREset are protected by copyright. Any unauthorized reproduction is prohibited.' },
  'terms.liability': { fr: 'Limitation de Responsabilité', en: 'Limitation of Liability' },
  'terms.liabilityText': { fr: 'FACTUREset ne peut être tenu responsable des pertes de données, interruptions de service ou dommages indirects liés à l\'utilisation de la plateforme.', en: 'FACTUREset cannot be held responsible for data loss, service interruptions, or indirect damages related to the use of the platform.' },
  'terms.modification': { fr: 'Modifications', en: 'Modifications' },
  'terms.modificationText': { fr: 'Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront notifiés des changements significatifs.', en: 'We reserve the right to modify these terms at any time. Users will be notified of significant changes.' },
};

// Language state management
let currentLang: Lang = (localStorage.getItem('factureset_lang') as Lang) || 'fr';

export function setLang(lang: Lang) {
  currentLang = lang;
  localStorage.setItem('factureset_lang', lang);
}

export function getLang(): Lang {
  return currentLang;
}

export function t(key: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] || entry['fr'] || key;
}
