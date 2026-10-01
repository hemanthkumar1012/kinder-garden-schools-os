const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getCompany() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('company') || 'null');
  } catch {
    return null;
  }
}

export function setAuth(token, company) {
  localStorage.setItem('token', token);
  localStorage.setItem('company', JSON.stringify(company));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('company');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (formData) => request('/settings/update', { method: 'POST', body: formData }),

  // Classes
  createClass: (body) => request('/classes/create', { method: 'POST', body: JSON.stringify(body) }),
  listClasses: (companyId) => request(`/classes/list?companyId=${companyId || ''}`),
  publicClasses: (subdomain) => request(`/classes/public?subdomain=${subdomain}`),

  // Admissions
  createAdmission: (formData) => request('/admissions/create', { method: 'POST', body: formData }),
  listAdmissions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admissions/list?${q}`);
  },
  admissionsStats: (companyId) => request(`/admissions/stats?companyId=${companyId || ''}`),
  admissionsInquiries: (companyId) => request(`/admissions/inquiries?companyId=${companyId || ''}`),
  updateAdmissionStatus: (body) => request('/admissions/status', { method: 'POST', body: JSON.stringify(body) }),

  // Gallery
  createGallery: (formData) => request('/gallery/create', { method: 'POST', body: formData }),
  listGallery: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/gallery/list?${q}`);
  },
  publicGallery: (subdomain, category) => {
    let url = `/gallery/public?subdomain=${subdomain}`;
    if (category) url += `&category=${category}`;
    return request(url);
  },
  deleteGallery: (galleryId) => request('/gallery/delete', { method: 'POST', body: JSON.stringify({ galleryId }) }),

  // Feedback
  createFeedback: (body) => request('/feedback/create', { method: 'POST', body: JSON.stringify(body) }),
  listFeedback: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/feedback/list?${q}`);
  },
  publicFeedback: (subdomain) => request(`/feedback/public?subdomain=${subdomain}`),
  updateFeedbackStatus: (body) => request('/feedback/status', { method: 'POST', body: JSON.stringify(body) }),
  feedbackStats: (companyId) => request(`/feedback/stats?companyId=${companyId || ''}`),

  // Webinars
  createWebinar: (formData) => request('/webinars/create', { method: 'POST', body: formData }),
  listWebinars: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/webinars/list?${q}`);
  },
  publicWebinars: (subdomain) => request(`/webinars/public?subdomain=${subdomain}`),
  registerWebinar: (body) => request('/webinars/register', { method: 'POST', body: JSON.stringify(body) }),
  webinarRegistrations: (webinarId) => request(`/webinars/registrations?webinarId=${webinarId}`),
  updateWebinarStatus: (body) => request('/webinars/status', { method: 'POST', body: JSON.stringify(body) }),

  // Fees
  createFee: (body) => request('/fees/create', { method: 'POST', body: JSON.stringify(body) }),
  listFees: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/fees/list?${q}`);
  },
  payFee: (body) => request('/fees/pay', { method: 'POST', body: JSON.stringify(body) }),

  // WhatsApp
  sendWhatsApp: (body) => request('/whatsapp/send', { method: 'POST', body: JSON.stringify(body) }),
};
