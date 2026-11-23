/**
 * Checks for critical food safety violations across complaints
 * Business Rule:
 * Trigger an urgent alert if 3 or more hygiene/foreign_object/stale complaints
 * are logged from the same base kitchen within any 2-hour sliding window.
 *
 * @param {Array<Object>} complaints 
 * @param {Array<Object>} kitchens 
 * @returns {Array<Object>} Active alert objects
 */
export function evaluateKitchenSafetyAlerts(complaints = [], kitchens = []) {
  if (!complaints.length) return [];

  const kitchenMap = kitchens.reduce((acc, k) => ({ ...acc, [k.id]: k }), {});
  const criticalCategories = ['hygiene_issue', 'foreign_object', 'stale_spoiled_food'];

  // Filter only critical complaints
  const criticalComplaints = complaints.filter((c) => criticalCategories.includes(c.category));

  // Group by kitchen
  const groupedByKitchen = criticalComplaints.reduce((acc, c) => {
    if (!acc[c.kitchenId]) acc[c.kitchenId] = [];
    acc[c.kitchenId].push(c);
    return acc;
  }, {});

  const alerts = [];
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

  Object.entries(groupedByKitchen).forEach(([kId, items]) => {
    // Sort chronologically
    const sorted = [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Sliding window check: check if any 3 complaints occurred within 2 hours
    for (let i = 0; i < sorted.length - 2; i++) {
      const start = new Date(sorted[i].createdAt).getTime();
      const end = new Date(sorted[i + 2].createdAt).getTime();

      if (end - start <= TWO_HOURS_MS) {
        const kitchenName = kitchenMap[kId]?.location || kId;
        alerts.push({
          id: `alert-${kId}-${start}`,
          kitchenId: kId,
          kitchenName,
          complaintCount: 3,
          timeWindow: '2 hours',
          severity: 'CRITICAL',
          message: `URGENT FOOD SAFETY ALERT: 3+ critical hygiene violations detected from ${kitchenName} within 2 hours! Immediate health inspection dispatched.`,
          detectedAt: new Date().toISOString()
        });
        break; // One alert per kitchen is sufficient
      }
    }
  });

  return alerts;
}
