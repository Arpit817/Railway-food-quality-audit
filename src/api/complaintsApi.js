import api from './client.js';
import { VENDORS, KITCHENS, BATCHES, COMPLAINTS, QR_CODES } from '../utils/mockData.js';
import { generateRandomToken } from '../utils/complaintUtils.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

// Local storage cache keys for offline persistence
const LOCAL_STORAGE_KEY = 'railfood_audit_complaints_v1';
const CUSTOM_BATCHES_KEY = 'railfood_custom_batches';
const CUSTOM_QRCODES_KEY = 'railfood_custom_qrcodes';

export function getCustomBatches() {
  try {
    const saved = localStorage.getItem(CUSTOM_BATCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCustomBatches(batches) {
  try {
    localStorage.setItem(CUSTOM_BATCHES_KEY, JSON.stringify(batches));
  } catch {
    // Ignore storage quota errors
  }
}

export function getCustomQRCodes() {
  try {
    const saved = localStorage.getItem(CUSTOM_QRCODES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCustomQRCodes(qrCodes) {
  try {
    localStorage.setItem(CUSTOM_QRCODES_KEY, JSON.stringify(qrCodes));
  } catch {
    // Ignore storage quota errors
  }
}

function getLocalComplaints() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return [];
    const list = JSON.parse(saved);
    if (!Array.isArray(list)) return [];
    // Only return real complaints created by the user (filter out cmp-001 to cmp-020 sample data)
    return list.filter((c) => !/^cmp-0(0[1-9]|1[0-9]|20)$/.test(c.id));
  } catch {
    return [];
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
    // 1. Try Supabase Cloud Database first if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('complaints').select('*').order('createdAt', { ascending: false });
        if (params.status && params.status !== 'all') {
          query = query.eq('status', params.status);
        }
        if (params.severity && params.severity !== 'all') {
          query = query.eq('severity', params.severity);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local cache:', err);
      }
    }

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
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .or(`id.eq.${id},referenceNo.eq.${id}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch {}
    }

    try {
      return await api.get(`/complaints/${id}`);
    } catch {
      const list = getLocalComplaints();
      const match = list.find((c) => c.id === id || c.referenceNo === id);
      if (match) return match;
      throw new Error(`Complaint ${id} not found`);
    }
  },

  // POST /complaints
  create: async (complaintData) => {
    const newEntry = {
      id: complaintData.id || `cmp-${Date.now()}`,
      ...complaintData,
      createdAt: complaintData.createdAt || new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('complaints').insert([newEntry]).select().single();
        if (!error && data) {
          saveLocalComplaints([data, ...getLocalComplaints()]);
          return data;
        }
      } catch (err) {
        console.warn('Supabase insert failed, saving locally:', err);
      }
    }

    try {
      return await api.post('/complaints', complaintData);
    } catch {
      const list = getLocalComplaints();
      const updatedList = [newEntry, ...list];
      saveLocalComplaints(updatedList);
      return newEntry;
    }
  },

  // PATCH /complaints/:id
  updateStatus: async (id, updatePayload) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: current } = await supabase.from('complaints').select('*').eq('id', id).maybeSingle();
        const actionLog = {
          id: `log-${Date.now()}`,
          action: 'STATUS_CHANGE',
          remarks: updatePayload.remarks || `Status transitioned to ${updatePayload.status}`,
          timestamp: new Date().toISOString(),
          userId: updatePayload.userId || 'inspector-active'
        };
        const updatedLogs = [...(current?.actionLogs || []), actionLog];
        const { data: updated, error } = await supabase
          .from('complaints')
          .update({ status: updatePayload.status, actionLogs: updatedLogs })
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) {
          const list = getLocalComplaints();
          saveLocalComplaints(list.map((c) => (c.id === id ? updated : c)));
          return updated;
        }
      } catch (err) {
        console.warn('Supabase updateStatus failed:', err);
      }
    }

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
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('complaints').delete().eq('id', id);
      } catch {}
    }
    try {
      return await api.delete(`/complaints/${id}`);
    } catch {
      const list = getLocalComplaints();
      const updatedList = list.filter((c) => c.id !== id);
      saveLocalComplaints(updatedList);
      return { success: true };
    }
  },

  // Clear all complaints for a clean slate
  clearAll: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('complaints').delete().neq('id', 'placeholder');
      } catch {}
    }
    saveLocalComplaints([]);
    return [];
  },

  // Reset to initial demo records
  resetDemoData: async () => {
    saveLocalComplaints(COMPLAINTS);
    return COMPLAINTS;
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
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('batches').select('*').order('producedAt', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase getBatches failed, falling back to local cache:', err);
      }
    }
    return getCustomBatches();
  },

  // Vendor & Kitchen Action: Create Batch with real Packaging QR Tokens
  createBatchWithTokens: async ({ kitchenId, vendorId, trainNumber, itemType, quantity }) => {
    const count = Math.max(1, Math.min(2000, Number(quantity) || 10));
    const cleanTrain = String(trainNumber || '12424').trim();
    const batchId = `bat-${Date.now()}-${cleanTrain}`;
    
    const newBatch = {
      id: batchId,
      trainNumber: cleanTrain,
      itemType: String(itemType || 'Standard Veg Thali').trim(),
      kitchenId: kitchenId || 'kit-101',
      vendorId: vendorId || 'ven-001',
      producedAt: new Date().toISOString(),
      expiryAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      status: 'active'
    };

    const tokens = [];
    for (let i = 0; i < count; i++) {
      tokens.push(generateRandomToken(10));
    }

    const newQRCodes = tokens.map((tok) => ({
      token: tok,
      batchId: batchId,
      status: 'active',
      scanCount: 0,
      createdAt: new Date().toISOString()
    }));

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('batches').insert([newBatch]);
        await supabase.from('qr_codes').insert(newQRCodes);
      } catch (err) {
        console.warn('Supabase batch insert failed, saving locally:', err);
      }
    }

    const existingBatches = getCustomBatches();
    saveCustomBatches([newBatch, ...existingBatches]);

    const existingQRs = getCustomQRCodes();
    saveCustomQRCodes([...newQRCodes, ...existingQRs]);

    return { batch: newBatch, tokens, qrCodes: newQRCodes };
  },

  // GET /qrCodes/:token
  resolveToken: async (token) => {
    const cleanToken = (token || '').trim();
    if (!cleanToken) return [];

    // 1. If Supabase configured, check cloud qr_codes
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('qr_codes')
          .select('*')
          .ilike('token', cleanToken)
          .maybeSingle();
        if (!error && data) {
          return [data];
        }
      } catch {}
    }

    // 2. Check custom QR codes generated by catering vendors in local storage
    const customQRs = getCustomQRCodes();
    const customMatch = customQRs.find((q) => q.token.toLowerCase() === cleanToken.toLowerCase());
    if (customMatch) {
      return [customMatch];
    }

    // 2. Try network API
    try {
      const data = await api.get(`/qrCodes?token=${cleanToken}`);
      if (Array.isArray(data) && data.length > 0) return data;
      
      // Fallback to QR_CODES
      const match = QR_CODES.find((q) => q.token.toLowerCase() === cleanToken.toLowerCase());
      if (match) return [match];

      // If token is a valid 8-12 char alphanumeric token, link to first custom batch or bat-901
      if (/^[a-zA-Z0-9]{8,12}$/.test(cleanToken)) {
        const customBatches = getCustomBatches();
        const fallbackBatchId = customBatches[0]?.id || 'bat-901';
        return [{ token: cleanToken, batchId: fallbackBatchId, status: 'active', scanCount: 1 }];
      }
      return [];
    } catch {
      const match = QR_CODES.find((q) => q.token.toLowerCase() === cleanToken.toLowerCase());
      if (match) return [match];

      if (/^[a-zA-Z0-9]{8,12}$/.test(cleanToken)) {
        const customBatches = getCustomBatches();
        const fallbackBatchId = customBatches[0]?.id || 'bat-901';
        return [{ token: cleanToken, batchId: fallbackBatchId, status: 'active', scanCount: 1 }];
      }
      return [];
    }
  }
};

export const feedbackApi = {
  // Save passenger meal feedback (goes to vendor scorecard, not to inspector)
  create: async (feedbackData) => {
    const newEntry = {
      id: feedbackData.id || `fbk-${Date.now()}`,
      ...feedbackData,
      createdAt: feedbackData.createdAt || new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('feedback').insert([newEntry]).select().single();
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase feedback insert failed, saving locally:', err);
      }
    }

    // Fallback: local storage
    try {
      const saved = localStorage.getItem('railfood_passenger_feedback');
      const list = saved ? JSON.parse(saved) : [];
      const updated = [newEntry, ...list];
      localStorage.setItem('railfood_passenger_feedback', JSON.stringify(updated));
    } catch {}
    return newEntry;
  },

  // Get all feedback for a vendor (vendor scorecard)
  getByVendor: async (vendorId) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('vendorId', vendorId)
          .order('createdAt', { ascending: false });
        if (!error && Array.isArray(data)) return data;
      } catch {}
    }
    try {
      const saved = localStorage.getItem('railfood_passenger_feedback');
      const list = saved ? JSON.parse(saved) : [];
      return list.filter((f) => f.vendorId === vendorId);
    } catch {
      return [];
    }
  },

  // Get overall ratings summary for a vendor
  getRatingSummary: async (vendorId) => {
    const feedbacks = await feedbackApi.getByVendor(vendorId);
    if (!feedbacks.length) return null;
    const avg = (key) => {
      const vals = feedbacks.map((f) => Number(f[key])).filter((v) => !isNaN(v) && v > 0);
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
    };
    return {
      count: feedbacks.length,
      overall: avg('overallRating'),
      foodQuality: avg('foodQualityRating'),
      quantity: avg('quantityRating'),
      packaging: avg('packagingRating'),
      temperature: avg('temperatureRating')
    };
  }
};

export default complaintsApi;
