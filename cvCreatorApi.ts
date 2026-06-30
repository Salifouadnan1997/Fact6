// ═══════════════════════════════════════════════════════════════
// CV Creator Pro — API Integration
// Base URL: https://019e51d1-2fef-77ee-8fee-369d170407b1.arena.site/api/v1
// ═══════════════════════════════════════════════════════════════

export const API_BASE = 'https://019e51d1-2fef-77ee-8fee-369d170407b1.arena.site/api/v1';
export const API_KEY = import.meta.env.VITE_STRIPE_KEY;

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};


// Helper for fetch with error handling
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = { ...options, headers: { ...headers, ...options.headers } };
  
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    // Handle 204 No Content
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`[CV Creator API] ${endpoint}:`, error);
    throw error;
  }
}

// --- Users ---
export const cvApi = {
  getUsers: () => apiCall('/users', { method: 'GET' }),
  createUser: (data: { name: string; email: string; password: string; role?: string; subscription?: string }) => 
    apiCall('/users', { method: 'POST', body: JSON.stringify(data) }),

  // --- CVs ---
  getCv: (userId: string) => apiCall(`/cv/${userId}`, { method: 'GET' }),
  updateCv: (userId: string, data: any) => 
    apiCall(`/cv/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // --- Templates & Stamps ---
  getTemplates: () => apiCall('/templates', { method: 'GET' }),
  getStamps: () => apiCall('/stamps', { method: 'GET' }),

  // --- Files ---
  uploadFile: (file: File, userId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    return apiCall('/files/upload', {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY }, // Don't set Content-Type for FormData
      body: formData,
    });
  },
};
