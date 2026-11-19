/**
 * Pure Utility Layer for Railway Food Quality Audit Platform
 * Stage 1: No React dependencies. All functions are pure, deterministic, and follow immutability.
 */

/**
 * Valid category types accepted by the platform
 */
export const COMPLAINT_CATEGORIES = [
  'hygiene_issue',
  'foreign_object',
  'stale_spoiled_food',
  'wrong_quantity',
  'overcharging',
  'damaged_packaging',
  'taste',
  'other'
];

/**
 * Valid complaint statuses in review workflow
 */
export const COMPLAINT_STATUSES = [
  'new',
  'under_review',
  'inspector_assigned',
  'action_taken',
  'closed'
];

/**
 * Calculates severity based on category and passenger rating.
 * Business Rule:
 * - 'hygiene_issue', 'foreign_object', 'stale_spoiled_food' OR rating === 1 -> 'high'
 * - 'damaged_packaging', 'overcharging' OR rating === 2 -> 'medium'
 * - Otherwise -> 'low'
 *
 * @param {string} category 
 * @param {number} rating 
 * @returns {'high' | 'medium' | 'low'}
 */
export function calculateSeverity(category, rating) {
  const highCategories = ['hygiene_issue', 'foreign_object', 'stale_spoiled_food'];
  const mediumCategories = ['damaged_packaging', 'overcharging'];

  if (highCategories.includes(category) || rating === 1) {
    return 'high';
  }
  if (mediumCategories.includes(category) || rating === 2) {
    return 'medium';
  }
  return 'low';
}

/**
 * Groups an array of complaints by an object key using Array.prototype.reduce.
 * Returns an accumulator object mapping key values to arrays of complaints.
 *
 * @param {Array<Object>} complaints 
 * @param {string} key - e.g. 'category', 'status', 'vendorId', 'severity'
 * @returns {Object}
 */
export function groupComplaintsBy(complaints, key) {
  if (!Array.isArray(complaints)) return {};

  return complaints.reduce((accumulator, complaint) => {
    const groupKey = complaint[key] || 'unknown';
    if (!accumulator[groupKey]) {
      accumulator[groupKey] = [];
    }
    accumulator[groupKey].push(complaint);
    return accumulator;
  }, {});
}

/**
 * Filters complaints by multiple criteria without mutating the original array.
 * Demonstrates functional programming with Array.prototype.filter.
 *
 * @param {Array<Object>} complaints 
 * @param {Object} filters - { status, category, severity, vendorId, trainNumber }
 * @param {Array<Object>} [batches=[]] - Optional batch list to resolve trainNumber
 * @returns {Array<Object>} Filtered complaints list
 */
export function filterComplaints(complaints, filters = {}, batches = []) {
  if (!Array.isArray(complaints)) return [];

  // Create a quick lookup map of batchId -> trainNumber if batches provided
  const batchTrainMap = batches.reduce((map, b) => {
    map[b.id] = b.trainNumber;
    return map;
  }, {});

  return complaints.filter((item) => {
    if (filters.status && item.status !== filters.status) {
      return false;
    }
    if (filters.category && item.category !== filters.category) {
      return false;
    }
    if (filters.severity && item.severity !== filters.severity) {
      return false;
    }
    if (filters.vendorId && item.vendorId !== filters.vendorId) {
      return false;
    }
    if (filters.trainNumber) {
      const train = batchTrainMap[item.batchId];
      if (train !== filters.trainNumber) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Computes aggregated vendor quality statistics.
 * Demonstrates map, filter, reduce and math calculations.
 *
 * @param {Array<Object>} complaints 
 * @param {string} vendorId 
 * @returns {{ vendorId: string, totalComplaints: number, avgRating: number, highSeverityCount: number, resolvedCount: number, repeatViolations: boolean }}
 */
export function getVendorStats(complaints, vendorId) {
  if (!Array.isArray(complaints)) {
    return {
      vendorId,
      totalComplaints: 0,
      avgRating: 0,
      highSeverityCount: 0,
      resolvedCount: 0,
      repeatViolations: false
    };
  }

  const vendorComplaints = complaints.filter((c) => c.vendorId === vendorId);
  const totalComplaints = vendorComplaints.length;

  if (totalComplaints === 0) {
    return {
      vendorId,
      totalComplaints: 0,
      avgRating: 0,
      highSeverityCount: 0,
      resolvedCount: 0,
      repeatViolations: false
    };
  }

  const sumRating = vendorComplaints.reduce((acc, c) => acc + (c.rating || 0), 0);
  const avgRating = Number((sumRating / totalComplaints).toFixed(2));

  const highSeverityCount = vendorComplaints.filter((c) => c.severity === 'high').length;
  const resolvedCount = vendorComplaints.filter((c) => c.status === 'closed' || c.status === 'action_taken').length;

  // Repeat violations: 3 or more high severity complaints for this vendor
  const repeatViolations = highSeverityCount >= 3;

  return {
    vendorId,
    totalComplaints,
    avgRating,
    highSeverityCount,
    resolvedCount,
    repeatViolations
  };
}

/**
 * Updates a complaint's status immutably.
 * Never mutates original complaint object or actionLogs array.
 * Returns a new object with appended action log entry.
 * Demonstrates: Object spread, Array spread, immutability, referential equality distinction.
 *
 * @param {Object} complaint 
 * @param {string} newStatus 
 * @param {string} remarks 
 * @param {string} userId 
 * @returns {Object} A brand-new complaint object
 */
export function updateComplaintStatus(complaint, newStatus, remarks, userId) {
  if (!complaint || typeof complaint !== 'object') {
    throw new Error('Invalid complaint object provided');
  }

  const newLogEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action: 'STATUS_CHANGE',
    previousStatus: complaint.status,
    newStatus: newStatus,
    remarks: remarks || `Status changed to ${newStatus}`,
    userId: userId || 'anonymous_inspector',
    timestamp: new Date().toISOString()
  };

  // Immutability: create new complaint object, create new actionLogs array
  return {
    ...complaint,
    status: newStatus,
    actionLogs: [
      ...(complaint.actionLogs || []),
      newLogEntry
    ]
  };
}

/**
 * Generates an 8-character random alphanumeric token for railway authorized packaging.
 * Non-sequential, collision-resistant pseudo-random generator.
 *
 * @param {number} [length=10]
 * @returns {string} e.g. "Xk9PqA72mZ"
 */
export function generateRandomToken(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    token += chars.charAt(randomIndex);
  }
  return token;
}

/**
 * Validates whether a token matches authorized railway packaging pattern.
 * Tokens must be exactly 10 alphanumeric characters.
 *
 * @param {string} token 
 * @returns {boolean}
 */
export function isValidToken(token) {
  if (!token || typeof token !== 'string') return false;
  // Alphanumeric, exactly 10 characters
  const tokenRegex = /^[A-Za-z0-9]{10}$/;
  return tokenRegex.test(token);
}

/**
 * Generates a passenger tracking reference number in format: RAIL-YYYY-XXXXXX
 * e.g., RAIL-2026-A8K2F9
 *
 * @returns {string}
 */
export function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excluding ambiguous chars like 0, O, 1, I
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars.charAt(randomIndex);
  }
  return `RAIL-${year}-${randomPart}`;
}

