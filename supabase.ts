// ═══════════════════════════════════════════════════════════
// SUPABASE CLIENT CONFIGURATION
// ═══════════════════════════════════════════════════════════
// Replace these with your actual Supabase project credentials.
// In production, use environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const supabaseConfig: SupabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

// ═══════════════════════════════════════════════════════════
// SIMPLE HTTP CLIENT (no external Supabase SDK dependency)
// Works with Supabase PostgREST API directly
// ═══════════════════════════════════════════════════════════

class SupabaseClient {
  private url: string;
  private key: string;
  private sessionToken: string | null = null;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
    // Restore session from localStorage
    this.sessionToken = localStorage.getItem('factureset_session') || null;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      'apikey': this.key,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
    if (this.sessionToken) {
      h['Authorization'] = `Bearer ${this.sessionToken}`;
    } else {
      h['Authorization'] = `Bearer ${this.key}`;
    }
    return h;
  }

  // ── REST API Methods ──

  async from(table: string) {
    return {
      select: async (columns = '*', filters?: Record<string, string>) => {
        let url = `${this.url}/rest/v1/${table}?select=${columns}`;
        if (filters) {
          Object.entries(filters).forEach(([k, v]) => { url += `&${k}=eq.${v}`; });
        }
        const res = await fetch(url, { headers: this.headers() });
        if (!res.ok) throw new Error(`SELECT failed: ${res.statusText}`);
        return res.json();
      },

      insert: async (data: Record<string, unknown> | Record<string, unknown>[]) => {
        const res = await fetch(`${this.url}/rest/v1/${table}`, {
          method: 'POST',
          headers: this.headers(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`INSERT failed: ${res.statusText}`);
        return res.json();
      },

      update: async (data: Record<string, unknown>, filters: Record<string, string>) => {
        let url = `${this.url}/rest/v1/${table}?`;
        Object.entries(filters).forEach(([k, v]) => { url += `${k}=eq.${v}&`; });
        const res = await fetch(url, {
          method: 'PATCH',
          headers: this.headers(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`UPDATE failed: ${res.statusText}`);
        return res.json();
      },

      delete: async (filters: Record<string, string>) => {
        let url = `${this.url}/rest/v1/${table}?`;
        Object.entries(filters).forEach(([k, v]) => { url += `${k}=eq.${v}&`; });
        const res = await fetch(url, {
          method: 'DELETE',
          headers: this.headers(),
        });
        if (!res.ok) throw new Error(`DELETE failed: ${res.statusText}`);
        return true;
      },
    };
  }

  // ── Storage ──
  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const res = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.sessionToken || this.key}`,
      },
      body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
  }

  // ── RPC (Stored Procedures) ──
  async rpc(fnName: string, params?: Record<string, unknown>) {
    const res = await fetch(`${this.url}/rest/v1/rpc/${fnName}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error(`RPC ${fnName} failed: ${res.statusText}`);
    return res.json();
  }

  // Session management
  setSession(token: string) {
    this.sessionToken = token;
    localStorage.setItem('factureset_session', token);
  }

  clearSession() {
    this.sessionToken = null;
    localStorage.removeItem('factureset_session');
  }

  isAuthenticated(): boolean {
    return !!this.sessionToken;
  }
}

export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
