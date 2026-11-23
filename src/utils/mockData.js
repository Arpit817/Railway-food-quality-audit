/**
 * Mock dataset for Railway Food Quality Audit Platform
 * Stage 1: Pure JavaScript data layer (No React)
 * 
 * Entities:
 * - Vendors (3)
 * - Kitchens (4 across Northern, Western, Southern zones)
 * - Batches (6 linked to kitchens and item types)
 * - Complaints (20 realistic railway passenger feedback entries)
 */

import { EVIDENCE_IMAGES } from './evidenceImages.js';

export const VENDORS = [
  {
    id: 'ven-001',
    name: 'Express Caterers Pvt Ltd',
    licenseNo: 'RR-CAT-2023-019',
    contact: '+91 98110 12345'
  },
  {
    id: 'ven-002',
    name: 'Pooja Rail Cuisines',
    licenseNo: 'RR-CAT-2022-088',
    contact: '+91 98220 23456'
  },
  {
    id: 'ven-003',
    name: 'Southern Rail Tiffins & Meals',
    licenseNo: 'RR-CAT-2024-004',
    contact: '+91 98440 34567'
  }
];

export const KITCHENS = [
  {
    id: 'kit-101',
    vendorId: 'ven-001',
    location: 'New Delhi Base Kitchen (NDLS)',
    fssaiLicense: '10019011000123',
    zone: 'Northern'
  },
  {
    id: 'kit-102',
    vendorId: 'ven-001',
    location: 'Kanpur Central Satellite Kitchen (CNB)',
    fssaiLicense: '10019011000456',
    zone: 'Northern'
  },
  {
    id: 'kit-103',
    vendorId: 'ven-002',
    location: 'Mumbai Central Base Kitchen (MMCT)',
    fssaiLicense: '10020022000789',
    zone: 'Western'
  },
  {
    id: 'kit-104',
    vendorId: 'ven-003',
    location: 'Chennai Central Base Kitchen (MAS)',
    fssaiLicense: '10021033000321',
    zone: 'Southern'
  }
];

export const BATCHES = [
  {
    id: 'bat-901',
    kitchenId: 'kit-101',
    itemType: 'Standard Veg Thali',
    producedAt: '2026-11-18T05:30:00Z',
    expiryAt: '2026-11-18T17:30:00Z',
    trainNumber: '12424' // New Delhi - Dibrugarh Rajdhani
  },
  {
    id: 'bat-902',
    kitchenId: 'kit-101',
    itemType: 'Paneer Kulcha Combo',
    producedAt: '2026-11-18T06:00:00Z',
    expiryAt: '2026-11-18T15:00:00Z',
    trainNumber: '12004' // New Delhi - Lucknow Shatabdi
  },
  {
    id: 'bat-903',
    kitchenId: 'kit-102',
    itemType: 'Vegetable Biryani',
    producedAt: '2026-11-18T11:00:00Z',
    expiryAt: '2026-11-18T21:00:00Z',
    trainNumber: '12424'
  },
  {
    id: 'bat-904',
    kitchenId: 'kit-103',
    itemType: 'Jain Meal Box',
    producedAt: '2026-11-18T07:15:00Z',
    expiryAt: '2026-11-18T18:15:00Z',
    trainNumber: '12951' // Mumbai Tejas Rajdhani
  },
  {
    id: 'bat-905',
    kitchenId: 'kit-103',
    itemType: 'Egg Curry Rice Meal',
    producedAt: '2026-11-18T08:00:00Z',
    expiryAt: '2026-11-18T18:00:00Z',
    trainNumber: '12952'
  },
  {
    id: 'bat-906',
    kitchenId: 'kit-104',
    itemType: 'South Indian Breakfast Combo',
    producedAt: '2026-11-18T04:45:00Z',
    expiryAt: '2026-11-18T12:45:00Z',
    trainNumber: '12622' // Tamil Nadu Express
  }
];

export const COMPLAINTS = [
  {
    id: 'cmp-001',
    referenceNo: 'RAIL-2026-K7M91A',
    token: 'Xk9PqA72mZ',
    batchId: 'bat-901',
    vendorId: 'ven-001',
    kitchenId: 'kit-101',
    rating: 1,
    category: 'foreign_object',
    comment: 'Found a dead insect inside the dal container of the veg thali.',
    severity: 'high',
    status: 'under_review',
    pnr: '2849102941',
    seat: 'B3-42',
    createdAt: '2026-11-18T08:15:00Z',
    images: [EVIDENCE_IMAGES.insectInDal],
    actionLogs: [
      {
        id: 'log-001',
        action: 'CREATED',
        remarks: 'Complaint registered by passenger via QR scan',
        timestamp: '2026-11-18T08:15:00Z',
        userId: 'system'
      },
      {
        id: 'log-002',
        action: 'STATUS_CHANGE',
        remarks: 'Flagged as high severity; assigned for initial verification',
        timestamp: '2026-11-18T08:20:00Z',
        userId: 'insp-01'
      }
    ]
  },
  {
    id: 'cmp-002',
    referenceNo: 'RAIL-2026-B2V48N',
    token: 'Lm7RzW91pQ',
    batchId: 'bat-901',
    vendorId: 'ven-001',
    kitchenId: 'kit-101',
    rating: 2,
    category: 'hygiene_issue',
    comment: 'Casserole lid seal was torn and greasy with fingerprint smudges.',
    severity: 'high',
    status: 'new',
    pnr: '2849105521',
    seat: 'B2-19',
    createdAt: '2026-11-18T08:30:00Z',
    images: [EVIDENCE_IMAGES.greasyPackaging],
    actionLogs: [
      {
        id: 'log-003',
        action: 'CREATED',
        remarks: 'Complaint registered by passenger',
        timestamp: '2026-11-18T08:30:00Z',
        userId: 'system'
      }
    ]
  },
  {
    id: 'cmp-003',
    referenceNo: 'RAIL-2026-Y8T31C',
    token: 'Jn4TxY63sV',
    batchId: 'bat-901',
    vendorId: 'ven-001',
    kitchenId: 'kit-101',
    rating: 1,
    category: 'stale_spoiled_food',
    comment: 'The curd was completely sour and watery, smelling bad.',
    severity: 'high',
    status: 'inspector_assigned',
    pnr: '2849108842',
    seat: 'B4-12',
    createdAt: '2026-11-18T09:05:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-004',
        action: 'CREATED',
        remarks: 'Complaint registered by passenger',
        timestamp: '2026-11-18T09:05:00Z',
        userId: 'system'
      },
      {
        id: 'log-005',
        action: 'STATUS_CHANGE',
        remarks: 'Kitchen inspection team alerted due to multiple complaints',
        timestamp: '2026-11-18T09:15:00Z',
        userId: 'insp-01'
      }
    ]
  },
  {
    id: 'cmp-004',
    referenceNo: 'RAIL-2026-P9Q12X',
    token: 'Wp3LkE88bA',
    batchId: 'bat-902',
    vendorId: 'ven-001',
    kitchenId: 'kit-101',
    rating: 3,
    category: 'wrong_quantity',
    comment: 'Only one small piece of paneer in the gravy, smaller portion than mandated.',
    severity: 'low',
    status: 'new',
    pnr: '1249821033',
    seat: 'C1-14',
    createdAt: '2026-11-18T09:20:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-006',
        action: 'CREATED',
        remarks: 'Complaint registered by passenger',
        timestamp: '2026-11-18T09:20:00Z',
        userId: 'system'
      }
    ]
  },
  {
    id: 'cmp-005',
    referenceNo: 'RAIL-2026-M5J67Z',
    token: 'Kr8NqZ24wM',
    batchId: 'bat-902',
    vendorId: 'ven-001',
    kitchenId: 'kit-101',
    rating: 2,
    category: 'damaged_packaging',
    comment: 'Curry leaked inside the paper bag and soaked the napkin packet.',
    severity: 'medium',
    status: 'action_taken',
    pnr: '1249824490',
    seat: 'C2-58',
    createdAt: '2026-11-18T09:40:00Z',
    images: [EVIDENCE_IMAGES.leakedCurry],
    actionLogs: [
      {
        id: 'log-007',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T09:40:00Z',
        userId: 'system'
      },
      {
        id: 'log-008',
        action: 'STATUS_CHANGE',
        remarks: 'Vendor cautioned on container heat-sealing quality',
        timestamp: '2026-11-18T10:10:00Z',
        userId: 'insp-01'
      }
    ]
  },
  {
    id: 'cmp-006',
    referenceNo: 'RAIL-2026-A1D89F',
    token: 'Zt9VsP51cD',
    batchId: 'bat-903',
    vendorId: 'ven-001',
    kitchenId: 'kit-102',
    rating: 2,
    category: 'taste',
    comment: 'Rice was excessively salty, couldn’t eat more than two spoons.',
    severity: 'low',
    status: 'closed',
    pnr: '2849109012',
    seat: 'A1-24',
    createdAt: '2026-11-18T12:30:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-009',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T12:30:00Z',
        userId: 'system'
      },
      {
        id: 'log-010',
        action: 'STATUS_CHANGE',
        remarks: 'Feedback recorded and shared with chef during debrief',
        timestamp: '2026-11-18T14:00:00Z',
        userId: 'insp-01'
      }
    ]
  },
  {
    id: 'cmp-007',
    referenceNo: 'RAIL-2026-H4G22E',
    token: 'Yv6BmQ77rE',
    batchId: 'bat-903',
    vendorId: 'ven-001',
    kitchenId: 'kit-102',
    rating: 1,
    category: 'foreign_object',
    comment: 'Found a sharp piece of staple wire in the biryani rice.',
    severity: 'high',
    status: 'under_review',
    pnr: '2849109923',
    seat: 'B5-33',
    createdAt: '2026-11-18T12:45:00Z',
    images: [EVIDENCE_IMAGES.stapleInRice],
    actionLogs: [
      {
        id: 'log-011',
        action: 'CREATED',
        remarks: 'High severity complaint recorded',
        timestamp: '2026-11-18T12:45:00Z',
        userId: 'system'
      }
    ]
  },
  {
    id: 'cmp-008',
    referenceNo: 'RAIL-2026-Q7W43T',
    token: 'Px2LjR39kL',
    batchId: 'bat-903',
    vendorId: 'ven-001',
    kitchenId: 'kit-102',
    rating: 2,
    category: 'overcharging',
    comment: 'Vendor charged Rs 15 extra above MRP printed on the tray seal.',
    severity: 'medium',
    status: 'new',
    pnr: '2849110482',
    seat: 'B6-04',
    createdAt: '2026-11-18T13:00:00Z',
    images: [EVIDENCE_IMAGES.billOvercharge],
    actionLogs: [
      {
        id: 'log-012',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T13:00:00Z',
        userId: 'system'
      }
    ]
  },
  {
    id: 'cmp-009',
    referenceNo: 'RAIL-2026-L3K88U',
    token: 'Nt5DsF41hS',
    batchId: 'bat-904',
    vendorId: 'ven-002',
    kitchenId: 'kit-103',
    rating: 1,
    category: 'stale_spoiled_food',
    comment: 'Food smelled rancid, green vegetable curry was bubbling and fermented.',
    severity: 'high',
    status: 'inspector_assigned',
    pnr: '4510293811',
    seat: 'E1-12',
    createdAt: '2026-11-18T09:10:00Z',
    images: [EVIDENCE_IMAGES.fermentedFood],
    actionLogs: [
      {
        id: 'log-013',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T09:10:00Z',
        userId: 'system'
      },
      {
        id: 'log-014',
        action: 'STATUS_CHANGE',
        remarks: 'Food safety officer notified for Western Railway',
        timestamp: '2026-11-18T09:25:00Z',
        userId: 'insp-02'
      }
    ]
  },
  {
    id: 'cmp-010',
    referenceNo: 'RAIL-2026-V9B11S',
    token: 'Mw8KxZ62qA',
    batchId: 'bat-904',
    vendorId: 'ven-002',
    kitchenId: 'kit-103',
    rating: 2,
    category: 'hygiene_issue',
    comment: 'Catering staff served meal without gloves or hairnet, hair found on butter foil.',
    severity: 'high',
    status: 'new',
    pnr: '4510294109',
    seat: 'E1-35',
    createdAt: '2026-11-18T09:30:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-015',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T09:30:00Z',
        userId: 'system'
      }
    ]
  },
  {
    id: 'cmp-011',
    referenceNo: 'RAIL-2026-N2M76Y',
    token: 'Bq1VcF83jP',
    batchId: 'bat-904',
    vendorId: 'ven-002',
    kitchenId: 'kit-103',
    rating: 3,
    category: 'taste',
    comment: 'Roti was tough and rubbery like rubber sheets.',
    severity: 'low',
    status: 'closed',
    pnr: '4510295874',
    seat: 'E2-08',
    createdAt: '2026-11-18T10:00:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-016',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T10:00:00Z',
        userId: 'system'
      },
      {
        id: 'log-017',
        action: 'STATUS_CHANGE',
        remarks: 'Reviewed and closed with kitchen supervisor',
        timestamp: '2026-11-18T11:00:00Z',
        userId: 'insp-02'
      }
    ]
  },
  {
    id: 'cmp-012',
    referenceNo: 'RAIL-2026-C8X45W',
    token: 'Qr9TpL34sK',
    batchId: 'bat-905',
    vendorId: 'ven-002',
    kitchenId: 'kit-103',
    rating: 1,
    category: 'foreign_object',
    comment: 'Small stone found in rice. Almost chipped my tooth.',
    severity: 'high',
    status: 'action_taken',
    pnr: '4510299901',
    seat: 'B1-18',
    createdAt: '2026-11-18T11:15:00Z',
    images: [EVIDENCE_IMAGES.stoneInRice],
    actionLogs: [
      {
        id: 'log-018',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T11:15:00Z',
        userId: 'system'
      },
      {
        id: 'log-019',
        action: 'STATUS_CHANGE',
        remarks: 'Vendor penalised under Clause 8 (Foreign Contaminant in Food)',
        timestamp: '2026-11-18T12:00:00Z',
        userId: 'insp-02'
      }
    ]
  },
  {
    id: 'cmp-013',
    referenceNo: 'RAIL-2026-G5T90K',
    token: 'Lx4KmA91vZ',
    batchId: 'bat-905',
    vendorId: 'ven-002',
    kitchenId: 'kit-103',
    rating: 2,
    category: 'damaged_packaging',
    comment: 'Egg curry container lid crushed under weight of other trays.',
    severity: 'medium',
    status: 'new',
    pnr: '4510301122',
    seat: 'B2-45',
    createdAt: '2026-11-18T11:45:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-020',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T11:45:00Z',
        userId: 'system'
      }
    ]
  },
  {
    id: 'cmp-014',
    referenceNo: 'RAIL-2026-E4R62P',
    token: 'Vy7NsQ18mR',
    batchId: 'bat-905',
    vendorId: 'ven-002',
    kitchenId: 'kit-103',
    rating: 3,
    category: 'other',
    comment: 'Meal delivered 2 hours late after Kanpur station crossing.',
    severity: 'low',
    status: 'closed',
    pnr: '4510304419',
    seat: 'B3-02',
    createdAt: '2026-11-18T13:30:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-021',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T13:30:00Z',
        userId: 'system'
      },
      {
        id: 'log-022',
        action: 'STATUS_CHANGE',
        remarks: 'Train delay verified from NTES portal. Closed.',
        timestamp: '2026-11-18T14:30:00Z',
        userId: 'insp-02'
      }
    ]
  },
  {
    id: 'cmp-015',
    referenceNo: 'RAIL-2026-K1L83J',
    token: 'Wz3BpR59tX',
    batchId: 'bat-906',
    vendorId: 'ven-003',
    kitchenId: 'kit-104',
    rating: 1,
    category: 'hygiene_issue',
    comment: 'Sambar had foul smell and oily grease slick floating on top.',
    severity: 'high',
    status: 'under_review',
    pnr: '7829104432',
    seat: 'S3-51',
    createdAt: '2026-11-18T07:15:00Z',
    images: [EVIDENCE_IMAGES.sambarContamination],
    actionLogs: [
      {
        id: 'log-023',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T07:15:00Z',
        userId: 'system'
      }
    ]
  },
  {
    id: 'cmp-016',
    referenceNo: 'RAIL-2026-U7Y29A',
    token: 'Kd2LmP48nB',
    batchId: 'bat-906',
    vendorId: 'ven-003',
    kitchenId: 'kit-104',
    rating: 2,
    category: 'stale_spoiled_food',
    comment: 'Coconut chutney had turned sour and foamy.',
    severity: 'high',
    status: 'inspector_assigned',
    pnr: '7829107718',
    seat: 'S4-18',
    createdAt: '2026-11-18T07:45:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-024',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T07:45:00Z',
        userId: 'system'
      },
      {
        id: 'log-025',
        action: 'STATUS_CHANGE',
        remarks: 'Southern railway health inspector dispatched to coach',
        timestamp: '2026-11-18T08:10:00Z',
        userId: 'insp-03'
      }
    ]
  },
  {
    id: 'cmp-017',
    referenceNo: 'RAIL-2026-F9M34Q',
    token: 'Ts8RvW14kL',
    batchId: 'bat-906',
    vendorId: 'ven-003',
    kitchenId: 'kit-104',
    rating: 3,
    category: 'wrong_quantity',
    comment: 'Only two small idlis provided instead of mandated three in standard menu.',
    severity: 'low',
    status: 'new',
    pnr: '7829109981',
    seat: 'S5-23',
    createdAt: '2026-11-18T08:00:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-026',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T08:00:00Z',
        userId: 'system'
      }
    ]
  },
  {
    id: 'cmp-018',
    referenceNo: 'RAIL-2026-D3V56Z',
    token: 'Qn6FzM27bK',
    batchId: 'bat-906',
    vendorId: 'ven-003',
    kitchenId: 'kit-104',
    rating: 2,
    category: 'overcharging',
    comment: 'Charged Rs 60 instead of standard approved rate of Rs 50.',
    severity: 'medium',
    status: 'under_review',
    pnr: '7829112001',
    seat: 'S2-09',
    createdAt: '2026-11-18T08:20:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-027',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T08:20:00Z',
        userId: 'system'
      }
    ]
  },
  {
    id: 'cmp-019',
    referenceNo: 'RAIL-2026-S8P12L',
    token: 'Mb4VxQ73nE',
    batchId: 'bat-901',
    vendorId: 'ven-001',
    kitchenId: 'kit-101',
    rating: 4,
    category: 'taste',
    comment: 'Food was decent but excessively spicy for children.',
    severity: 'low',
    status: 'closed',
    pnr: '2849114421',
    seat: 'B1-02',
    createdAt: '2026-11-18T09:45:00Z',
    images: [],
    actionLogs: [
      {
        id: 'log-028',
        action: 'CREATED',
        remarks: 'Complaint registered',
        timestamp: '2026-11-18T09:45:00Z',
        userId: 'system'
      },
      {
        id: 'log-029',
        action: 'STATUS_CHANGE',
        remarks: 'Noted as subjective feedback',
        timestamp: '2026-11-18T10:15:00Z',
        userId: 'insp-01'
      }
    ]
  },
  {
    id: 'cmp-020',
    referenceNo: 'RAIL-2026-W5K99M',
    token: 'Gh9RtL81zV',
    batchId: 'bat-902',
    vendorId: 'ven-001',
    kitchenId: 'kit-101',
    rating: 1,
    category: 'foreign_object',
    comment: 'Found a piece of hard brittle plastic shard inside the packaging.',
    severity: 'high',
    status: 'new',
    pnr: '1249829910',
    seat: 'C3-22',
    createdAt: '2026-11-18T10:05:00Z',
    images: [EVIDENCE_IMAGES.plasticShard],
    actionLogs: [
      {
        id: 'log-030',
        action: 'CREATED',
        remarks: 'Complaint registered via mobile QR portal',
        timestamp: '2026-11-18T10:05:00Z',
        userId: 'system'
      }
    ]
  }
];

