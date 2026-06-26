import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || '/api';
if (rawApiUrl !== '/api' && !rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  if (rawApiUrl.endsWith('/')) {
    rawApiUrl = rawApiUrl + 'api';
  } else {
    rawApiUrl = rawApiUrl + '/api';
  }
}

const apiBase = axios.create({
  baseURL: rawApiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
apiBase.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sprinthub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified API service exports
export const authAPI = {
  login: (credentials) => apiBase.post('/auth/login', credentials),
  register: (formData) => {
    const isMultipart = formData instanceof FormData;
    return apiBase.post('/auth/register', formData, {
      headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {}
    });
  },
  getProfile: () => apiBase.get('/auth/profile'),
  updateProfile: (formData) => {
    const isMultipart = formData instanceof FormData;
    return apiBase.put('/auth/profile', formData, {
      headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {}
    });
  },
  changePassword: (data) => apiBase.put('/auth/change-password', data),
  getUsersList: () => apiBase.get('/auth/users')
};

export const projectAPI = {
  create: (data) => apiBase.post('/projects', data),
  getAll: () => apiBase.get('/projects'),
  getById: (id) => apiBase.get(`/projects/${id}`),
  update: (id, data) => apiBase.put(`/projects/${id}`, data),
  delete: (id) => apiBase.delete(`/projects/${id}`)
};

export const taskAPI = {
  create: (data) => apiBase.post('/tasks', data),
  getAll: (params = {}) => apiBase.get('/tasks', { params }),
  getById: (id) => apiBase.get(`/tasks/${id}`),
  update: (id, data) => apiBase.put(`/tasks/${id}`, data),
  delete: (id) => apiBase.delete(`/tasks/${id}`)
};

export const dashboardAPI = {
  getStats: () => apiBase.get('/dashboard/stats')
};

export const notificationAPI = {
  getAll: () => apiBase.get('/notifications'),
  markRead: (id) => apiBase.put(`/notifications/${id}/read`),
  markAllRead: () => apiBase.put('/notifications/read-all'),
  delete: (id) => apiBase.delete(`/notifications/${id}`)
};

export default apiBase;
