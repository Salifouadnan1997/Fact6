// ═══════════════════════════════════════════════════════════════════════════
// FACTUREset — API REST d'Intégration
// Couche d'abstraction pour connecter le frontend aux services Supabase
// ═══════════════════════════════════════════════════════════════════════════

import supabase from './supabase';
import { sanitizeObject, auditLogger, validateInvoice, apiRateLimiter } from './security';

// ── Types de réponse API ──
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { count?: number; page?: number; limit?: number };
}

// ═══════════════════════════════════════
// INVOICES API
// ═══════════════════════════════════════
export const InvoicesAPI = {
  async list(page = 1, limit = 20): Promise<ApiResponse> {
    const rl = apiRateLimiter.check('invoices:list');
    if (!rl.allowed) return { success: false, error: 'Rate limit dépassé' };
    try {
      const table = await supabase.from('invoices');
      const data = await table.select('*,invoice_items(*)');
      auditLogger.log('LIST', 'invoices', undefined, `Page ${page}`);
      return { success: true, data, meta: { page, limit } };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async getById(id: string): Promise<ApiResponse> {
    try {
      const table = await supabase.from('invoices');
      const data = await table.select('*,invoice_items(*)', { id });
      auditLogger.log('READ', 'invoices', id);
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async create(invoice: Record<string, unknown>): Promise<ApiResponse> {
    const clean = sanitizeObject(invoice as any);
    const validation = validateInvoice(clean as any);
    if (!validation.valid) return { success: false, error: validation.errors.join(', ') };
    try {
      const table = await supabase.from('invoices');
      const data = await table.insert(clean);
      auditLogger.log('CREATE', 'invoices', undefined, `Facture créée`);
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse> {
    const clean = sanitizeObject(updates as any);
    try {
      const table = await supabase.from('invoices');
      const data = await table.update(clean, { id });
      auditLogger.log('UPDATE', 'invoices', id);
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async delete(id: string): Promise<ApiResponse> {
    try {
      const table = await supabase.from('invoices');
      await table.delete({ id });
      auditLogger.log('DELETE', 'invoices', id);
      return { success: true };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },
};

// ═══════════════════════════════════════
// PRODUCTS API
// ═══════════════════════════════════════
export const ProductsAPI = {
  async list(): Promise<ApiResponse> {
    try {
      const table = await supabase.from('products');
      const data = await table.select('*');
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async create(product: Record<string, unknown>): Promise<ApiResponse> {
    const clean = sanitizeObject(product as any);
    try {
      const table = await supabase.from('products');
      const data = await table.insert(clean);
      auditLogger.log('CREATE', 'products', undefined, `Produit: ${clean.name}`);
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const table = await supabase.from('products');
      const data = await table.update(sanitizeObject(updates as any), { id });
      auditLogger.log('UPDATE', 'products', id);
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async delete(id: string): Promise<ApiResponse> {
    try {
      const table = await supabase.from('products');
      await table.delete({ id });
      auditLogger.log('DELETE', 'products', id);
      return { success: true };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async uploadImage(productId: string, file: File): Promise<ApiResponse> {
    try {
      const path = `products/${productId}/${Date.now()}_${file.name}`;
      const url = await supabase.uploadFile('product-images', path, file);
      return { success: true, data: { url } };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },
};

// ═══════════════════════════════════════
// CLIENTS API
// ═══════════════════════════════════════
export const ClientsAPI = {
  async list(): Promise<ApiResponse> {
    try {
      const table = await supabase.from('clients');
      const data = await table.select('*');
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async create(client: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const table = await supabase.from('clients');
      const data = await table.insert(sanitizeObject(client as any));
      auditLogger.log('CREATE', 'clients', undefined, `Client: ${client.name}`);
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const table = await supabase.from('clients');
      const data = await table.update(sanitizeObject(updates as any), { id });
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async delete(id: string): Promise<ApiResponse> {
    try {
      const table = await supabase.from('clients');
      await table.delete({ id });
      auditLogger.log('DELETE', 'clients', id);
      return { success: true };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },
};

// ═══════════════════════════════════════
// ANALYTICS API (Adnana IA)
// ═══════════════════════════════════════
export const AnalyticsAPI = {
  async getDashboard(): Promise<ApiResponse> {
    try {
      const revenue = await supabase.rpc('get_monthly_revenue');
      const topProducts = await supabase.rpc('get_top_products');
      return { success: true, data: { revenue, topProducts } };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async getSalesTrend(days = 7): Promise<ApiResponse> {
    try {
      const data = await supabase.rpc('get_sales_trend', { days_count: days });
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },

  async getStockAlerts(): Promise<ApiResponse> {
    try {
      const table = await supabase.from('products');
      const data = await table.select('*');
      // Filter low stock client-side for demo
      const alerts = (data as any[]).filter((p: any) => p.stock <= p.min_stock);
      return { success: true, data: alerts };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },
};

// ═══════════════════════════════════════
// AUDIT API
// ═══════════════════════════════════════
export const AuditAPI = {
  getLocalLogs() {
    return auditLogger.getAll();
  },

  async getRemoteLogs(): Promise<ApiResponse> {
    try {
      const table = await supabase.from('audit_logs');
      const data = await table.select('*');
      return { success: true, data };
    } catch (e) { return { success: false, error: (e as Error).message }; }
  },
};
