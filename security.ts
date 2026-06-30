// ═══════════════════════════════════════════════════════════════════════
// FACTUREset — Système de Sécurité Complet
// Protection des données, validation, rate limiting, audit
// ═══════════════════════════════════════════════════════════════════════

// ── 1. Input Sanitization (XSS Protection) ──
export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const clean = { ...obj };
  for (const key of Object.keys(clean)) {
    if (typeof clean[key] === 'string') {
      (clean as any)[key] = sanitize(clean[key] as string);
    }
  }
  return clean;
}

// ── 2. CSRF Token Management ──
export function generateCSRFToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

let csrfToken: string | null = null;

export function getCSRFToken(): string {
  if (!csrfToken) {
    csrfToken = sessionStorage.getItem('factureset_csrf') || generateCSRFToken();
    sessionStorage.setItem('factureset_csrf', csrfToken);
  }
  return csrfToken;
}

export function validateCSRFToken(token: string): boolean {
  return token === getCSRFToken();
}

// ── 3. Rate Limiter (Client-side) ──
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 60, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const valid = timestamps.filter(t => now - t < this.windowMs);
    
    if (valid.length >= this.maxRequests) {
      const oldest = valid[0];
      return { allowed: false, remaining: 0, resetIn: this.windowMs - (now - oldest) };
    }
    
    valid.push(now);
    this.requests.set(key, valid);
    return { allowed: true, remaining: this.maxRequests - valid.length, resetIn: 0 };
  }
}

export const apiRateLimiter = new RateLimiter(100, 60000);   // 100 req/min for API
export const exportRateLimiter = new RateLimiter(10, 60000);  // 10 exports/min
export const loginRateLimiter = new RateLimiter(5, 300000);   // 5 attempts/5min

// ── 4. Data Validation ──
export const validators = {
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: (v: string) => /^[\+]?[\d\s\-\(\)]{8,20}$/.test(v),
  ifu: (v: string) => /^[A-Z0-9\-]{5,30}$/.test(v.toUpperCase()),
  rccm: (v: string) => /^[A-Z0-9\-]{5,40}$/i.test(v),
  invoiceNumber: (v: string) => /^[A-Z]{2,4}\-\d{4}\-\d{3,6}$/.test(v),
  amount: (v: number) => typeof v === 'number' && v >= 0 && v <= 999999999,
  quantity: (v: number) => Number.isInteger(v) && v > 0 && v <= 99999,
  percentage: (v: number) => typeof v === 'number' && v >= 0 && v <= 100,
  text: (v: string, min = 1, max = 500) => typeof v === 'string' && v.trim().length >= min && v.length <= max,
  sku: (v: string) => /^[A-Z0-9\-]{3,20}$/.test(v.toUpperCase()),
};

export function validateInvoice(inv: {
  companyName: string; rccm: string; ifu: string; invoiceNumber: string;
  clientName: string; totalAmount: number; vatRate: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!validators.text(inv.companyName, 2, 200)) errors.push('Nom entreprise invalide');
  if (!validators.text(inv.clientName, 1, 200)) errors.push('Nom client requis');
  if (!validators.amount(inv.totalAmount)) errors.push('Montant total invalide');
  if (!validators.percentage(inv.vatRate)) errors.push('Taux TVA invalide');
  return { valid: errors.length === 0, errors };
}

// ── 5. Secure API Request Wrapper ──
export async function secureApiRequest(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
  apiKey?: string
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  // Rate limit check
  const rl = apiRateLimiter.check(url);
  if (!rl.allowed) {
    return { ok: false, error: `Rate limit dépassé. Réessayez dans ${Math.ceil(rl.resetIn / 1000)}s` };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
      'X-Request-ID': crypto.randomUUID(),
      'X-Timestamp': Date.now().toString(),
    };

    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });

    if (!res.ok) {
      return { ok: false, error: `Erreur ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: `Erreur réseau: ${(err as Error).message}` };
  }
}

// ── 6. Audit Logger (Local) ──
interface AuditEntry {
  timestamp: string;
  action: string;
  table: string;
  recordId?: string;
  userId?: string;
  details?: string;
}

class AuditLogger {
  private logs: AuditEntry[] = [];
  private maxLogs = 1000;

  log(action: string, table: string, recordId?: string, details?: string) {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      table,
      recordId,
      details,
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) this.logs.pop();
    // Persist to localStorage
    try {
      localStorage.setItem('factureset_audit', JSON.stringify(this.logs.slice(0, 200)));
    } catch { /* quota exceeded, ignore */ }
  }

  getAll(): AuditEntry[] {
    if (this.logs.length === 0) {
      try {
        const stored = localStorage.getItem('factureset_audit');
        if (stored) this.logs = JSON.parse(stored);
      } catch { /* ignore */ }
    }
    return this.logs;
  }

  clear() {
    this.logs = [];
    localStorage.removeItem('factureset_audit');
  }
}

export const auditLogger = new AuditLogger();

// ── 7. Data Encryption Helpers ──
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateApiKey(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return 'fset_' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export function generateDigitalSignature(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return 'SIG-' + Array.from(arr, b => b.toString(16).padStart(2, '0').toUpperCase()).join('').match(/.{4}/g)!.join('-');
}

// ── 8. Content Security Policy Headers (for reference) ──
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
