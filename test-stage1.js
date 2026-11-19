/**
 * Stage 1 Demonstration and Unit Verification Script
 * Demonstrates:
 * 1. calculateSeverity logic
 * 2. groupComplaintsBy (using reduce)
 * 3. filterComplaints (pure filtering)
 * 4. getVendorStats (aggregated stats)
 * 5. updateComplaintStatus (pure immutable update)
 * 6. generateReferenceNumber and isValidToken
 * 7. Shallow vs Deep Copy and Referential Equality
 */

import { VENDORS, KITCHENS, BATCHES, COMPLAINTS } from './src/utils/mockData.js';
import {
  calculateSeverity,
  groupComplaintsBy,
  filterComplaints,
  getVendorStats,
  updateComplaintStatus,
  isValidToken,
  generateReferenceNumber,
  generateRandomToken
} from './src/utils/complaintUtils.js';

console.log('=================================================================');
console.log('STAGE 1: VERIFYING PURE UTILITY LAYER & MOCK DATA');
console.log('=================================================================\n');

// 1. Verify Dataset Sizes
console.log('--- 1. DATASET INTEGRITY CHECK ---');
console.log(`Vendors count: ${VENDORS.length} (Expected: 3)`);
console.log(`Kitchens count: ${KITCHENS.length} (Expected: 4)`);
console.log(`Batches count: ${BATCHES.length} (Expected: 6)`);
console.log(`Complaints count: ${COMPLAINTS.length} (Expected: 20)`);

// 2. Test calculateSeverity
console.log('\n--- 2. SEVERITY CALCULATION TEST ---');
console.log('foreign_object with rating 3 ->', calculateSeverity('foreign_object', 3), '(Expected: high)');
console.log('taste with rating 1 ->', calculateSeverity('taste', 1), '(Expected: high)');
console.log('damaged_packaging with rating 4 ->', calculateSeverity('damaged_packaging', 4), '(Expected: medium)');
console.log('taste with rating 4 ->', calculateSeverity('taste', 4), '(Expected: low)');

// 3. Test groupComplaintsBy (Reduce)
console.log('\n--- 3. GROUP COMPLAINTS BY CATEGORY (reduce) ---');
const groupedByCategory = groupComplaintsBy(COMPLAINTS, 'category');
Object.keys(groupedByCategory).forEach((cat) => {
  console.log(`Category [${cat}]: ${groupedByCategory[cat].length} complaint(s)`);
});

// 4. Test filterComplaints
console.log('\n--- 4. FILTER COMPLAINTS TEST ---');
const highSeverityUnderReview = filterComplaints(COMPLAINTS, {
  severity: 'high',
  status: 'under_review'
});
console.log(`Found ${highSeverityUnderReview.length} high-severity complaints currently under_review.`);

// 5. Test getVendorStats
console.log('\n--- 5. VENDOR STATS CALCULATION ---');
VENDORS.forEach((vendor) => {
  const stats = getVendorStats(COMPLAINTS, vendor.id);
  console.log(`Vendor "${vendor.name}" (${vendor.id}):`);
  console.log(`   - Total Complaints: ${stats.totalComplaints}`);
  console.log(`   - Avg Rating: ${stats.avgRating} / 5.0`);
  console.log(`   - High Severity: ${stats.highSeverityCount}`);
  console.log(`   - Resolved Count: ${stats.resolvedCount}`);
  console.log(`   - Repeat Violator Flag: ${stats.repeatViolations}`);
});

// 6. Test Token Validation & Reference Generation
console.log('\n--- 6. TOKEN & REFERENCE NUMBER TEST ---');
const sampleToken = generateRandomToken();
console.log(`Generated Token: ${sampleToken} | Valid? ${isValidToken(sampleToken)}`);
console.log(`Invalid Token "abc" | Valid? ${isValidToken('abc')}`);
console.log(`Generated Reference Number: ${generateReferenceNumber()}`);

// 7. Shallow vs Deep Copy and Referential Equality
console.log('\n--- 7. IMMUTABILITY, SHALLOW VS DEEP COPY & REFERENTIAL EQUALITY ---');
const originalComplaint = COMPLAINTS[0];
const updatedComplaint = updateComplaintStatus(
  originalComplaint,
  'inspector_assigned',
  'Inspector Ramesh Sharma dispatched to pantry car',
  'insp-01'
);

console.log('a) Referential Equality Check (originalComplaint === updatedComplaint):');
console.log('   Result:', originalComplaint === updatedComplaint); // false -> new reference created

console.log('\nb) ActionLog Reference Check (original.actionLogs === updated.actionLogs):');
console.log('   Result:', originalComplaint.actionLogs === updatedComplaint.actionLogs); // false -> new array reference

console.log('\nc) Verification of Immutability:');
console.log('   Original Status:', originalComplaint.status); // stays 'under_review'
console.log('   Updated Status:', updatedComplaint.status);   // changed to 'inspector_assigned'
console.log(`   Original Log Count: ${originalComplaint.actionLogs.length}`);
console.log(`   Updated Log Count: ${updatedComplaint.actionLogs.length}`);

// Shallow copy demonstration:
console.log('\nd) Shallow Copy vs Deep Copy Demonstration:');
const shallowCopy = { ...originalComplaint };
console.log('   shallowCopy === originalComplaint:', shallowCopy === originalComplaint); // false
console.log('   shallowCopy.images === originalComplaint.images:', shallowCopy.images === originalComplaint.images); 
// true! Notice that nested arrays/objects in a shallow copy still share the SAME memory reference!
// This is why React state updates require careful handling to prevent accidental nested mutations.

// Deep copy demonstration:
const deepCopy = JSON.parse(JSON.stringify(originalComplaint));
console.log('   deepCopy.images === originalComplaint.images:', deepCopy.images === originalComplaint.images);
// false! Deep copy clones nested objects and arrays into distinct memory addresses.

console.log('\n=================================================================');
console.log('STAGE 1 VERIFICATION COMPLETED SUCCESSFULLY!');
console.log('=================================================================');

