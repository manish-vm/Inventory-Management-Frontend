import axios from 'axios';

const API_URL = "https://inventory-management-backend-k76m.onrender.com/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
};

// Super Admin APIs
export const superAdminAPI = {
  login: (data) => api.post('/superadmin/login', data),
  getMe: () => api.get('/superadmin/me'),
  
  // Admin Management
  getAdmins: () => api.get('/superadmin/admins'),
  getAdmin: (id) => api.get(`/superadmin/admins/${id}`),
  createAdmin: (data) => api.post('/superadmin/admins', data),
  updateAdmin: (id, data) => api.put(`/superadmin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/superadmin/admins/${id}`),
  resetAdminPassword: (id, password) => api.post(`/superadmin/admins/${id}/reset-password`, { password }),
  
  // Dealer Management
  getDealers: () => api.get('/superadmin/dealers'),
  getDealer: (id) => api.get(`/superadmin/dealers/${id}`),
  createDealer: (data) => api.post('/superadmin/dealers', data),
  updateDealer: (id, data) => api.put(`/superadmin/dealers/${id}`, data),
  deleteDealer: (id) => api.delete(`/superadmin/dealers/${id}`),
  
  // Subscription Plans
  getPlans: () => api.get('/superadmin/plans'),
  getPlan: (id) => api.get(`/superadmin/plans/${id}`),
  createPlan: (data) => api.post('/superadmin/plans', data),
  updatePlan: (id, data) => api.put(`/superadmin/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/superadmin/plans/${id}`),
  
  // Dashboard
  getDashboardStats: () => api.get('/superadmin/dashboard'),
  
  // Activity Logs
  getActivityLogs: (params) => api.get('/superadmin/logs', { params }),
};

// Public axios instance (no auth interceptor)
const publicApi = axios.create({
  baseURL: API_URL,
});

// Public APIs (for HomePage - no auth required)
export const publicAPI = {
  getPlans: () => publicApi.get('/superadmin/plans/public'),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getLowStock: () => api.get('/dashboard/low-stock'),
  getSalesChart: () => api.get('/dashboard/sales-chart'),
  getCategoryDistribution: () => api.get('/dashboard/category-distribution'),
  getTopProducts: (days = 30, limit = 10) => api.get(`/dashboard/top-products?days=${days}&limit=${limit}`),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCode: (code) => api.get('/products/code/' + code),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put('/products/' + id, data),
  delete: (id) => api.delete('/products/' + id),
  getLowStock: () => api.get('/products/low-stock/all'),
  getCategories: () => api.get('/products/categories/all'),
  createCategory: (data) => api.post('/products/categories', data),
  updateCategory: (id, data) => api.put('/products/categories/' + id, data),
  deleteCategory: (id) => api.delete('/products/categories/' + id),
  getSubcategories: (params) => api.get('/products/subcategories/all', { params }),
  createSubcategory: (data) => api.post('/products/subcategories', data),
  updateSubcategory: (id, data) => api.put('/products/subcategories/' + id, data),
  deleteSubcategory: (id) => api.delete('/products/subcategories/' + id),
};

// Billing APIs
export const billingAPI = {
  checkout: (data) => api.post('/billing/checkout', data),
  getInvoices: (params) => api.get('/billing/invoices', { params }),
  getInvoiceById: (id) => api.get('/billing/invoices/' + id),
  getInvoiceByNumber: (number) => api.get('/billing/invoice-number/' + number),
  refund: (id) => api.post('/billing/refund/' + id),
  downloadInvoicePDF: (id) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}/billing/invoices/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
      if (!response.ok) throw new Error('Failed to download PDF');
      return response.blob();
    }).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }
};

// Refund Request APIs
export const refundRequestAPI = {
  create: (data) => api.post('/refund-requests', data),
  getAll: (params) => api.get('/refund-requests', { params }),
  getMy: () => api.get('/refund-requests/my'),
  approve: (id) => api.put('/refund-requests/' + id + '/approve'),
  reject: (id, reason) => api.put('/refund-requests/' + id + '/reject', { reason }),
  getPendingCount: () => api.get('/refund-requests/pending/count')
};

// Customer APIs
export const customerAPI = {
  getAll: () => api.get('/customers'),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put('/customers/' + id, data),
  delete: (id) => api.delete('/customers/' + id),
  toggleStatus: (id) => api.patch('/customers/status/' + id),
};

// Employee APIs (same as customer APIs)
export const employeeAPI = {
  createEmployee: (data) => api.post('/employees', data),
  getEmployees: () => api.get('/employees'),
  updateEmployee: (id, data) => api.put('/employees/' + id, data),
  deleteEmployee: (id) => api.delete('/employees/' + id),
  toggleEmployeeStatus: (id) => api.patch('/employees/status/' + id),
  getActiveEmployees: () => api.get('/employees/active'),
  updateSalesTarget: (id, target) => api.put(`/employees/target/${id}`, { target }),
  resetSalesCount: (id) => api.post(`/employees/reset-count/${id}`),
  getEmployeeProfile: () => api.get('/employees/profile'),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put('/notifications/' + id + '/read'),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete('/notifications/' + id),
  getAllAdmins: () => api.get('/notifications/admins'),
  getUsers: (type) => api.get('/notifications/users', { params: { type } }),
  sendToAdmin: (data) => api.post('/notifications/to-admin', data),
  broadcastToEmployees: (data) => api.post('/notifications/broadcast-employees', data),
  broadcastToCustomers: (data) => api.post('/notifications/broadcast-customers', data),
};

// Chatbot APIs (Gemini AI)
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/chat', { message }),
  clearHistory: () => api.post('/chatbot/clear'),
};

export default api;

