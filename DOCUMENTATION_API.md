# 📄 FACTUREset — Documentation d'Intégration API

## 🔗 Base URL
```
https://your-project.supabase.co/rest/v1
```

## 🔐 Authentification
Toutes les requêtes API nécessitent les headers suivants :
```
apikey: votre_supabase_anon_key
Authorization: Bearer votre_api_token
Content-Type: application/json
X-CSRF-Token: votre_csrf_token
```

---

## 📦 Endpoints

### 1. FACTURES

#### Lister les factures
```http
GET /invoices?select=*,invoice_items(*)&order=date_time.desc
```

#### Créer une facture
```http
POST /invoices
Content-Type: application/json

{
  "company_id": "uuid",
  "invoice_number": "FA-2026-0590",
  "document_type": "Facture normalisée",
  "client_name": "Hôtel Ivoire",
  "client_phone": "+225 07 11 22 33",
  "subtotal": 125000,
  "vat_rate": 18,
  "vat_amount": 22500,
  "total_amount": 147500,
  "amount_paid": 150000,
  "payment_method": "Espèces",
  "paper_size": "80mm"
}
```

#### Mettre à jour une facture
```http
PATCH /invoices?id=eq.uuid
Content-Type: application/json

{
  "status": "Payée",
  "amount_paid": 150000
}
```

#### Supprimer une facture
```http
DELETE /invoices?id=eq.uuid
```

---

### 2. LIGNES DE FACTURE

#### Ajouter des articles
```http
POST /invoice_items
Content-Type: application/json

[
  {
    "invoice_id": "uuid",
    "product_id": "uuid",
    "name": "Riz Parfumé 25kg",
    "quantity": 2,
    "unit_price": 22500,
    "total": 45000,
    "weight": "25kg",
    "color": ""
  }
]
```

---

### 3. PRODUITS

#### Lister les produits
```http
GET /products?select=*&is_active=eq.true&order=name
```

#### Créer un produit
```http
POST /products
{
  "company_id": "uuid",
  "name": "Smartphone Pro 128GB",
  "sku": "ELE-SMP-128",
  "price": 185000,
  "cost_price": 150000,
  "stock": 12,
  "min_stock": 4,
  "weight": "180g",
  "color": "Noir"
}
```

---

### 4. CLIENTS

```http
GET /clients?select=*&order=name
POST /clients { "name": "...", "phone": "...", "ifu": "...", "rccm": "..." }
PATCH /clients?id=eq.uuid { "loyalty_status": "VIP" }
DELETE /clients?id=eq.uuid
```

---

### 5. ANALYTICS (Adnana IA)

#### Chiffre d'affaires mensuel
```http
POST /rpc/get_monthly_revenue
{}
```

#### Top produits vendus
```http
POST /rpc/get_top_products
{ "limit_count": 10 }
```

#### Tendance des ventes
```http
POST /rpc/get_sales_trend
{ "days_count": 7 }
```

#### Alertes de stock
```http
GET /products?select=*&stock=lte.min_stock
```

---

### 6. JOURNAL D'AUDIT

```http
GET /audit_logs?select=*&order=created_at.desc&limit=100
```

---

## 🛡️ Sécurité

### Row Level Security (RLS)
Chaque table a des policies RLS qui isolent les données par `company_id`. Un utilisateur ne peut jamais accéder aux données d'une autre entreprise.

### Rate Limiting
| Endpoint | Limite |
|----------|--------|
| API REST | 100 req/min |
| Exports PDF/PNG | 10/min |
| Connexion | 5 tentatives/5min |

### Validation des données
- Sanitization XSS sur tous les champs texte
- Validation des montants (0 - 999,999,999 FCFA)
- Validation des formats IFU, RCCM, SKU
- CSRF Token requis pour les mutations

### Headers de sécurité recommandés
```
Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## 🔧 Configuration Supabase

### Variables d'environnement (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...votre_clé
```

### Fichiers de configuration
| Fichier | Description |
|---------|-------------|
| `src/config/supabase.ts` | Client HTTP Supabase |
| `src/config/security.ts` | Sanitization, CSRF, Rate Limiting, Audit |
| `src/config/api-integration.ts` | Couche d'abstraction API REST |
| `src/config/database-schema.sql` | Schéma PostgreSQL complet |

---

## 📱 Webhooks (Optionnel)
Configurez des webhooks Supabase pour :
- Notification temps réel quand une facture est créée
- Alerte automatique quand un stock passe sous le seuil
- Synchronisation avec des outils externes (WhatsApp, Email)

```
POST https://votre-serveur.com/webhook/facture-creee
{
  "type": "INSERT",
  "table": "invoices",
  "record": { ... }
}
```

---

**FACTUREset** — Plateforme SaaS de gestion des factures et commercial
Contact: +2290166336546
