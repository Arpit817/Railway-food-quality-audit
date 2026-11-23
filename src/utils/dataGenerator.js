import { VENDORS, KITCHENS, BATCHES } from './mockData.js';
import { calculateSeverity } from './complaintUtils.js';
import { createEvidenceImage } from './evidenceImages.js';

const SAMPLE_COMMENTS = {
  hygiene_issue: [
    'Greasy oil smudges on casserole foil lid.',
    'Serving staff had no gloves or hairnet.',
    'Pantry tray arrived with dead ant near pickle sachet.',
    'Foul stale smell coming from napkin packet.'
  ],
  foreign_object: [
    'Found a piece of metal wire in biryani.',
    'Hard plastic shard mixed with rice grains.',
    'Small pebble stone inside dal container.',
    'Rubber band piece found inside paratha wrap.'
  ],
  stale_spoiled_food: [
    'Curd was bubbling, fermented and acidic.',
    'Paneer cubes felt rubbery and sour.',
    'Sambar had sour fermentation smell.',
    'Rice was clumpy, stale and emitting bad odor.'
  ],
  wrong_quantity: [
    'Only two small idlis provided instead of mandated three.',
    'Paneer gravy had only one single piece.',
    'Rice portion was less than 150g mandated quota.',
    'Pickle and butter sachet missing from standard thali.'
  ],
  overcharging: [
    'Vendor demanded Rs 20 extra above printed tray MRP.',
    'Waiter refused to provide GST bill for water bottle.',
    'Charged Rs 150 instead of approved IRCTC standard rate of Rs 120.',
    'Extra tip demanded aggressively before handing over tray.'
  ],
  damaged_packaging: [
    'Curry container lid crushed under carton weight.',
    'Torn foil seal; sambar leaked onto railway blanket.',
    'Cracked plastic lid with soup dripping into bread packet.',
    'Meal carton arrived open and exposed to train dust.'
  ],
  taste: [
    'Excessive salt in dal, completely unpalatable.',
    'Vegetable biryani was excessively spicy for children.',
    'Roti was stiff and burnt on edges.',
    'Dry and bland sabzi with no seasoning.'
  ],
  other: [
    'Meal served 2 hours late after crossing station.',
    'Tea bag provided with cold lukewarm water.',
    'Special Jain request ignored by pantry manager.'
  ]
};

const CATEGORIES = Object.keys(SAMPLE_COMMENTS);
const STATUSES = ['new', 'under_review', 'inspector_assigned', 'action_taken', 'closed'];

/**
 * Generates an arbitrary volume of realistic railway complaint records (default: 500)
 * Used to stress-test React rendering performance, Virtual DOM reconciliation, and memoization.
 *
 * @param {number} count 
 * @returns {Array<Object>}
 */
export function generateBulkComplaints(count = 500) {
  const complaints = [];
  const baseTime = new Date('2026-11-18T06:00:00Z').getTime();

  for (let i = 1; i <= count; i++) {
    const id = `cmp-bulk-${i}`;
    const hex = i.toString(16).padStart(4, '0').toUpperCase();
    const referenceNo = `RAIL-2026-${hex}`;
    const token = `TK${i.toString().padStart(6, '0')}`;

    const vendor = VENDORS[i % VENDORS.length];
    const kitchen = KITCHENS[i % KITCHENS.length];
    const batch = BATCHES[i % BATCHES.length];

    const category = CATEGORIES[i % CATEGORIES.length];
    const commentPool = SAMPLE_COMMENTS[category];
    const comment = commentPool[i % commentPool.length];

    // Ratings 1 to 4
    const rating = (i % 4) + 1;
    const severity = calculateSeverity(category, rating);
    const status = STATUSES[i % STATUSES.length];

    // Distribute timestamps over previous 12 hours
    const createdAt = new Date(baseTime + i * 80000).toISOString();

    complaints.push({
      id,
      referenceNo,
      token,
      batchId: batch.id,
      vendorId: vendor.id,
      kitchenId: kitchen.id,
      rating,
      category,
      comment,
      severity,
      status,
      pnr: `${1000000000 + i}`,
      seat: `Coach B${(i % 5) + 1}-${(i % 60) + 1}`,
      createdAt,
      images: i % 3 === 0 ? [createEvidenceImage(`Audit Sample #${id}`, 'Routine Inspection Evidence')] : [],
      actionLogs: [
        {
          id: `log-${id}-1`,
          action: 'CREATED',
          remarks: 'Complaint registered by passenger via authorized QR token',
          timestamp: createdAt,
          userId: 'system'
        }
      ]
    });
  }

  return complaints;
}
