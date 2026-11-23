import api from './client.js';

export const complaintsApi = {
  // GET /complaints (supports json-server filtering via query params)
  getAll: (params = {}) => api.get('/complaints', { params }),

  // GET /complaints/:id
  getById: (id) => api.get(`/complaints/${id}`),

  // POST /complaints
  create: (complaintData) => api.post('/complaints', complaintData),

  // PATCH /complaints/:id
  updateStatus: (id, updatePayload) => api.patch(`/complaints/${id}`, updatePayload),

  // DELETE /complaints/:id
  delete: (id) => api.delete(`/complaints/${id}`)
};

export const metadataApi = {
  // GET /vendors
  getVendors: () => api.get('/vendors'),

  // GET /kitchens
  getKitchens: () => api.get('/kitchens'),

  // GET /batches
  getBatches: () => api.get('/batches'),

  // GET /qrCodes/:token
  resolveToken: (token) => api.get(`/qrCodes?token=${token}`)
};
