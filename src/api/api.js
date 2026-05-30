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
  bulkUpload: (products) => api.post('/products/bulk-upload', { products }),
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
  getProductAnalytics: (id) => api.get(`/products/${id}/analytics`),
};

// Brand & Model APIs
export const brandModelAPI = {
  getActiveBrands: () => api.get('/brands'),
  getAllModels: () => api.get('/brands/models'),
  getModelsByBrand: (brandId) => api.get(`/brands/${brandId}/models`),
  createBrand: (data) => api.post('/brands', data),
  updateBrand: (id, data) => api.put(`/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/brands/${id}`),
  createModel: (brandId, data) => api.post(`/brands/${brandId}/models`, data),
  updateModel: (modelId, data) => api.put(`/brands/models/${modelId}`, data),
  deleteModel: (modelId) => api.delete(`/brands/models/${modelId}`),
};

// Defect Detail APIs
export const defectDetailAPI = {
  getAll: (params) => api.get('/defect-details', { params }),
  create: (data) => api.post('/defect-details', data),
  update: (id, data) => api.put(`/defect-details/${id}`, data),
  delete: (id) => api.delete(`/defect-details/${id}`),
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

// Employee APIs
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
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getAllAdmins: () => api.get('/notifications/admins'),
  getUsers: (type) => api.get('/notifications/users', { params: { type } }),
  sendToAdmin: (data) => api.post('/notifications/to-admin', data),
  broadcastToEmployees: (data) => api.post('/notifications/broadcast-employees', data),
};


// Chatbot APIs (Gemini AI)
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/chat', { message }),
  clearHistory: () => api.post('/chatbot/clear'),
};

// Product Master APIs (Helmet Production)
export const productMasterAPI = {
  getAll: (params) => api.get('/product-masters', { params }),
  getById: (id) => api.get('/product-masters/' + id),
  getByPartNo: (partNo) => api.get('/product-masters/part/' + partNo),
  create: (data) => api.post('/product-masters', data),
  upload: (data) => api.post('/product-masters/upload', data),
  update: (id, data) => api.put('/product-masters/' + id, data),
  delete: (id) => api.delete('/product-masters/' + id),
  getTypes: () => api.get('/product-masters/types'),
  getSubTypes: (params) => api.get('/product-masters/subtypes', { params }),
};

// QR Code APIs
export const qrCodeAPI = {
  getAll: (params) => api.get('/qr-codes', { params }),
  getStats: () => api.get('/qr-codes/stats'),
  getById: (id) => api.get('/qr-codes/' + id),
  getByQRId: (qrId) => api.get('/qr-codes/qr/' + qrId),
  create: (data) => api.post('/qr-codes', data),
  bulkCreate: (data) => api.post('/qr-codes/bulk', data),
  update: (id, data) => api.put('/qr-codes/' + id, data),
  updateProgress: (id, data) => api.put('/qr-codes/' + id + '/progress', data),
  delete: (id) => api.delete('/qr-codes/' + id),
};

// Manufacturing Config APIs
export const manufacturingConfigAPI = {
  getAll: (params) => api.get('/manufacturing-configs', { params }),
  getById: (id) => api.get('/manufacturing-configs/' + id),
  getByPartNo: (partNo) => api.get('/manufacturing-configs/part/' + partNo),
  create: (data) => api.post('/manufacturing-configs', data),
  validateStage: (data) => api.post('/manufacturing-configs/validate-stage', data),
  update: (id, data) => api.put('/manufacturing-configs/' + id, data),
  delete: (id) => api.delete('/manufacturing-configs/' + id),

  // Admin: review form builder
  getReviewForms: (id) => api.get(`/manufacturing-configs/${id}/review-forms`),
  saveReviewForms: (id, data) => api.put(`/manufacturing-configs/${id}/review-forms`, data)
};

// Raw Material APIs
export const rawMaterialAPI = {
  getAll: (params) => api.get('/raw-materials', { params }),
  getStats: () => api.get('/raw-materials/stats'),
  getById: (id) => api.get('/raw-materials/' + id),
  create: (data) => api.post('/raw-materials', data),
  update: (id, data) => api.put('/raw-materials/' + id, data),
  validate: (id, data) => api.put('/raw-materials/' + id + '/validate', data),
};

// Production Log APIs
export const productionLogAPI = {
  getAll: (params) => api.get('/production-logs', { params }),
  getStats: () => api.get('/production-logs/stats'),
  getDaily: () => api.get('/production-logs/daily'),
  getById: (id) => api.get('/production-logs/' + id),
  create: (data) => api.post('/production-logs', data),
  update: (id, data) => api.put('/production-logs/' + id, data),
};

// Processing Stage APIs
export const processingStageAPI = {
  getAll: (params) => api.get('/processing-stages', { params }),
  getStats: () => api.get('/processing-stages/stats'),
  getById: (id) => api.get('/processing-stages/' + id),
  create: (data) => api.post('/processing-stages', data),
  update: (id, data) => api.put('/processing-stages/' + id, data),
  complete: (id) => api.put('/processing-stages/' + id + '/complete'),
  validate: (id, data) => api.put('/processing-stages/' + id + '/validate', data),

  // Admin: stage-level review management
  getStageReviewStats: (stageNumber, params) =>
    api.get(`/processing-stages/review/stage/${stageNumber}/stats`, { params }),
  getStageReviewItems: (stageNumber) =>
    api.get(`/processing-stages/review/stage/${stageNumber}/items`),
  updateStageReview: (id, data) => api.put(`/processing-stages/review/${id}`, data),
};

// Enterprise inspection portal APIs
export const inspectionAPI = {
  getDashboard: () => api.get('/inspection/employee/dashboard'),
  scan: (qrId) => api.post('/inspection/employee/scan', { qrId }),
  searchProducts: (params) => api.get('/employees/products/search', { params }),
  lookupBatchProduct: (key) => api.get(`/employees/batch-product/${encodeURIComponent(key)}`),
  lookupProduct: (partNo) => api.get(`/employees/product/${encodeURIComponent(partNo)}`),
  submitEmployeeResponse: (data) => api.post('/employees/inspection-response', data),
  getProductHistory: (itemId) => api.get(`/employees/product-history/${encodeURIComponent(itemId)}`),
  getFormsByStage: (stageId, params) => api.get(`/forms/stage/${encodeURIComponent(stageId)}`, { params }),
  submit: (data) => api.post('/inspection/employee/submit', data),
  getScanLogs: (params) => api.get('/inspection/employee/scan-logs', { params }),
  getTraceability: (id) => api.get(`/inspection/employee/traceability/${id}`),
  getAdminTraceability: (id) => api.get(`/inspection/admin/traceability/${id}`),
  getAdminResponses: (params) => api.get('/inspection/admin/responses', { params }),
  getProductionAnalytics: () => api.get('/inspection/admin/production-analytics'),
  getAdminResponseById: (id) => api.get(`/inspection/admin/responses/${id}`)
};

// Assembly APIs
export const assemblyAPI = {
  getAll: (params) => api.get('/assemblies', { params }),
  getStats: () => api.get('/assemblies/stats'),
  getDaily: () => api.get('/assemblies/daily'),
  getById: (id) => api.get('/assemblies/' + id),
  create: (data) => api.post('/assemblies', data),
  update: (id, data) => api.put('/assemblies/' + id, data),
  finalize: (id) => api.put('/assemblies/' + id + '/finalize'),
};

export default api;

