import api from './client.js';
import { VENDORS, KITCHENS, BATCHES, COMPLAINTS, QR_CODES } from '../utils/mockData.js';

// Local storage cache keys for offline persistence
const LOCAL_STORAGE_KEY = 'railfood_audit_complaints_v1';

function getLocalComplaints() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : COMPLAINTS;
  } catch {
    return COMPLAINTS;
  }
}

function saveLocalComplaints(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
}

export const complaintsApi = {
  // GET /complaints
  getAll: async (params = {}) => {
    try {
      const data = await api.get('/complaints', { params });
      if (Array.isArray(data) && data.length > 0) return data;
      return getLocalComplaints();
    } catch {
      return getLocalComplaints();
    }
  },

  // GET /complaints/:id
  getById: async (id) => {
    try {
      return await api.get(`/complaints/${id}`);
    } catch {
      const list = getLocalComplaints();
      const match = list.find((c) => c.id === id);
      if (match) return match;
      throw new Error(`Complaint ${id} not found`);
    }
  },

  // POST /complaints
  create: async (complaintData) => {
    try {
      return await api.post('/complaints', complaintData);
    } catch {
      const list = getLocalComplaints();
      const newEntry = {
        id: `cmp-${Date.now()}`,
        ...complaintData,
        createdAt: complaintData.createdAt || new Date().toISOString()
      };
      const updatedList = [newEntry, ...list];
      saveLocalComplaints(updatedList);
      return newEntry;
    }
  },

  // PATCH /complaints/:id
  updateStatus: async (id, updatePayload) => {
    try {
      return await api.patch(`/complaints/${id}`, updatePayload);
    } catch {
      const list = getLocalComplaints();
      const updatedList = list.map((c) => {
        if (c.id === id) {
          const actionLog = {
            id: `log-${Date.now()}`,
            action: 'STATUS_CHANGE',
            remarks: updatePayload.remarks || `Status transitioned to ${updatePayload.status}`,
            timestamp: new Date().toISOString(),
            userId: updatePayload.userId || 'inspector-active'
          };
          return {
            ...c,
            status: updatePayload.status,
            actionLogs: [...(c.actionLogs || []), actionLog]
          };
        }
        return c;
      });
      saveLocalComplaints(updatedList);
      return updatedList.find((c) => c.id === id);
    }
  },

  // DELETE /complaints/:id
  delete: async (id) => {
    try {
      return await api.delete(`/complaints/${id}`);
    } catch {
      const list = getLocalComplaints();
      const updatedList = list.filter((c) => c.id !== id);
      saveLocalComplaints(updatedList);
      return { success: true };
    }
  }
};

export const metadataApi = {
  // GET /vendors
  getVendors: async () => {
    try {
      const data = await api.get('/vendors');
      return Array.isArray(data) && data.length > 0 ? data : VENDORS;
    } catch {
      return VENDORS;
    }
  },

  // GET /kitchens
  getKitchens: async () => {
    try {
      const data = await api.get('/kitchens');
      return Array.isArray(data) && data.length > 0 ? data : KITCHENS;
    } catch {
      return KITCHENS;
    }
  },

  // GET /batches
  getBatches: async () => {
    try {
      const data = await api.get('/batches');
      return Array.isArray(data) && data.length > 0 ? data : BATCHES;
    } catch {
      return BATCHES;
    }
  },

  // GET /qrCodes/:token
  resolveToken: async (token) => {
    const cleanToken = (token || '').trim();
    try {
      const data = await api.get(`/qrCodes?token=${cleanToken}`);
      if (Array.isArray(data) && data.length > 0) return data;
      // Fallback to QR_CODES
      const match = QR_CODES.find((q) => q.token.toLowerCase() === cleanToken.toLowerCase());
      if (match) return [match];
      // If token format is 10 chars alphanumeric, map to default batch bat-901
      if (/^[a-zA-Z0-9]{8,12}$/.test(cleanToken)) {
        return [{ token: cleanToken, batchId: 'bat-901', status: 'active', scanCount: 1 }];
      }
      return [];
    } catch {
      const match = QR_CODES.find((q) => q.token.toLowerCase() === cleanToken.toLowerCase());
      if (match) return [match];
      if (/^[a-zA-Z0-9]{8,12}$/.test(cleanToken)) {
        return [{ token: cleanToken, batchId: 'bat-901', status: 'active', scanCount: 1 }];
      }
      return [];
    }
  }
};

export default complaintsApi;
