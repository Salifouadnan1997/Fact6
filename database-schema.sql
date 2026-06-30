-- ═══════════════════════════════════════════════════════════════════════
-- FACTUREset — Supabase Database Schema
-- Base de données PostgreSQL pour la plateforme SaaS de facturation
-- ═══════════════════════════════════════════════════════════════════════

-- ── Extensions ──
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════════════════════════
-- 1. ENTREPRISES (Multi-tenant)
-- ══════════════════════════════════════
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  rccm VARCHAR(100),
  ifu VARCHAR(100),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  logo_url TEXT,
  slogan VARCHAR(255),
  legal_mention TEXT DEFAULT 'Facture normalisée conforme aux exigences fiscales.',
  thank_you_message VARCHAR(255) DEFAULT 'Merci de votre confiance !',
  primary_color VARCHAR(10) DEFAULT '#2563eb',
  api_key VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  api_secret VARCHAR(128) UNIQUE DEFAULT encode(gen_random_bytes(64), 'hex'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 2. UTILISATEURS
-- ══════════════════════════════════════
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Administrateur','Gérant','Caissier','Comptable')),
  status VARCHAR(20) DEFAULT 'Actif' CHECK (status IN ('Actif','Inactif')),
  permissions JSONB DEFAULT '[]'::jsonb,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 3. CATÉGORIES
-- ══════════════════════════════════════
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 4. FOURNISSEURS
-- ══════════════════════════════════════
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 5. PRODUITS
-- ══════════════════════════════════════
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(15,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  weight VARCHAR(50),
  color VARCHAR(50),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 6. CLIENTS
-- ══════════════════════════════════════
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  ifu VARCHAR(100),
  rccm VARCHAR(100),
  loyalty_status VARCHAR(20) DEFAULT 'Nouveau' CHECK (loyalty_status IN ('VIP','Régulier','Nouveau')),
  total_spent DECIMAL(15,2) DEFAULT 0,
  invoice_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 7. FACTURES
-- ══════════════════════════════════════
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  document_type VARCHAR(50) NOT NULL DEFAULT 'Facture normalisée',
  date_time TIMESTAMPTZ DEFAULT NOW(),
  seller_name VARCHAR(255),
  client_name VARCHAR(255),
  client_phone VARCHAR(50),
  subtotal DECIMAL(15,2) DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 18,
  vat_amount DECIMAL(15,2) DEFAULT 0,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  reliquat DECIMAL(15,2) DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'Espèces',
  paper_size VARCHAR(10) DEFAULT '80mm',
  template_id VARCHAR(50),
  digital_signature VARCHAR(100),
  qr_code_data TEXT,
  status VARCHAR(20) DEFAULT 'Payée' CHECK (status IN ('Payée','En attente','Annulée')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 8. LIGNES DE FACTURE
-- ══════════════════════════════════════
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  weight VARCHAR(50),
  color VARCHAR(50),
  image_url TEXT,
  description TEXT
);

-- ══════════════════════════════════════
-- 9. DÉPENSES
-- ══════════════════════════════════════
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  amount DECIMAL(15,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  authorized_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 10. CAISSES
-- ══════════════════════════════════════
CREATE TABLE caisses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'Fermée' CHECK (status IN ('Ouverte','Fermée')),
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  initial_amount DECIMAL(15,2) DEFAULT 0,
  current_amount DECIMAL(15,2) DEFAULT 0,
  cashier_name VARCHAR(255),
  cashier_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ══════════════════════════════════════
-- 11. JOURNAL D'AUDIT (Sécurité)
-- ══════════════════════════════════════
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 12. CLÉS API (Sécurité)
-- ══════════════════════════════════════
CREATE TABLE api_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  scopes JSONB DEFAULT '["read"]'::jsonb,
  rate_limit INTEGER DEFAULT 100,
  requests_today INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 13. TEMPLATES
-- ══════════════════════════════════════
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  paper_size VARCHAR(10) DEFAULT '80mm',
  primary_color VARCHAR(10) DEFAULT '#2563eb',
  font_family VARCHAR(50) DEFAULT 'font-sans',
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- INDEXES POUR PERFORMANCE
-- ══════════════════════════════════════
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_date ON invoices(date_time DESC);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at DESC);
CREATE INDEX idx_api_tokens_hash ON api_tokens(token_hash);
CREATE INDEX idx_expenses_company ON expenses(company_id);

-- ══════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE caisses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own company's data
CREATE POLICY company_isolation ON companies FOR ALL USING (id = current_setting('app.company_id')::uuid);
CREATE POLICY users_isolation ON users FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY categories_isolation ON categories FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY suppliers_isolation ON suppliers FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY products_isolation ON products FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY clients_isolation ON clients FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY invoices_isolation ON invoices FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY invoice_items_isolation ON invoice_items FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE company_id = current_setting('app.company_id')::uuid)
);
CREATE POLICY expenses_isolation ON expenses FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY caisses_isolation ON caisses FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY audit_isolation ON audit_logs FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY tokens_isolation ON api_tokens FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY templates_isolation ON templates FOR ALL USING (company_id = current_setting('app.company_id')::uuid);

-- ══════════════════════════════════════
-- STORED PROCEDURES
-- ══════════════════════════════════════

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(company UUID)
RETURNS TEXT AS $$
DECLARE
  cnt INTEGER;
  yr TEXT;
BEGIN
  yr := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO cnt FROM invoices WHERE company_id = company AND EXTRACT(YEAR FROM date_time) = EXTRACT(YEAR FROM NOW());
  RETURN 'FA-' || yr || '-' || LPAD(cnt::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Update stock after invoice
CREATE OR REPLACE FUNCTION update_stock_after_invoice()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET stock = stock - NEW.quantity, updated_at = NOW()
  WHERE id = NEW.product_id AND stock >= NEW.quantity;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_update AFTER INSERT ON invoice_items
FOR EACH ROW EXECUTE FUNCTION update_stock_after_invoice();

-- Auto audit log
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (company_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    COALESCE(NEW.company_id, OLD.company_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION log_audit();
