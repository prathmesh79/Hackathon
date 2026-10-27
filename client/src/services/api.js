const API_BASE = '/api';

async function fetchJSON(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Transactions API
export const transactionsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/transactions${query ? `?${query}` : ''}`);
  },
  getById: (id) => fetchJSON(`/transactions/${id}`),
  import: (data) => fetchJSON('/transactions/import', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  exportCSV: () => `${API_BASE}/transactions/export/csv`
};

// Analysis API
export const analysisAPI = {
  getSummary: () => fetchJSON('/analysis/summary'),
  run: () => fetchJSON('/analysis/run', { method: 'POST' }),
  getGraph: () => fetchJSON('/analysis/graph')
};

// Alerts API
export const alertsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/alerts${query ? `?${query}` : ''}`);
  },
  getById: (id) => fetchJSON(`/alerts/${id}`),
  updateStatus: (id, data) => fetchJSON(`/alerts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  addNote: (id, data) => fetchJSON(`/alerts/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  exportCSV: () => `${API_BASE}/alerts/export/csv`
};

// Cases API
export const casesAPI = {
  getAll: () => fetchJSON('/cases'),
  getById: (id) => fetchJSON(`/cases/${id}`),
  create: (data) => fetchJSON('/cases', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchJSON(`/cases/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
};

// Settings API
export const settingsAPI = {
  get: () => fetchJSON('/settings'),
  update: (data) => fetchJSON('/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// Demo API
export const demoAPI = {
  reset: () => fetchJSON('/demo/reset', { method: 'POST' })
};
