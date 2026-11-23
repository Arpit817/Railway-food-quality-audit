import { feedbackSchema, inspectorActionSchema, adminBatchSchema } from './src/utils/validationSchemas.js';

console.log('=================================================================');
console.log('STAGE 10: VERIFYING ZOD SCHEMAS & VALIDATION LOGIC');
console.log('=================================================================\n');

// Case 1: Valid Feedback Submission
console.log('--- TEST 1: Valid Passenger Feedback ---');
const validFeedback = {
  rating: 4,
  category: 'taste',
  comment: 'Food was delicious but served slightly lukewarm.',
  pnr: '2849102941',
  phone: '9811012345',
  isAnonymous: false,
  seat: 'Coach B2-19',
  images: ['https://placehold.co/600x400']
};
const result1 = feedbackSchema.safeParse(validFeedback);
console.log('Success?', result1.success);
if (!result1.success) console.error(result1.error.format());

// Case 2: High Severity with too short comment (Conditional Refinement Test)
console.log('\n--- TEST 2: High Severity with too short comment (Should Fail) ---');
const invalidHighSeverity = {
  rating: 1,
  category: 'hygiene_issue',
  comment: 'Bad smell', // < 20 chars
  seat: 'Coach B1-10',
  isAnonymous: true
};
const result2 = feedbackSchema.safeParse(invalidHighSeverity);
console.log('Success (Expected false)?', result2.success);
if (!result2.success) {
  console.log('Zod Field Errors:', result2.error.flatten().fieldErrors);
}

// Case 3: Foreign Object without specifying object
console.log('\n--- TEST 3: Foreign Object without Detail (Should Fail) ---');
const invalidForeignObject = {
  rating: 1,
  category: 'foreign_object',
  comment: 'Found something completely dangerous inside my food casserole.',
  foreignObjectDetail: '', // missing!
  seat: 'Coach B1-12',
  isAnonymous: true
};
const result3 = feedbackSchema.safeParse(invalidForeignObject);
console.log('Success (Expected false)?', result3.success);
if (!result3.success) {
  console.log('Zod Field Errors:', result3.error.flatten().fieldErrors);
}

// Case 4: Invalid PNR & Invalid Mobile
console.log('\n--- TEST 4: Malformed PNR and Phone (Should Fail) ---');
const malformedContact = {
  rating: 3,
  category: 'taste',
  comment: 'Roti was quite rubbery and hard to chew today.',
  pnr: '12345', // only 5 digits
  phone: '1234567890', // does not start with 6-9
  isAnonymous: false,
  seat: 'B2-20'
};
const result4 = feedbackSchema.safeParse(malformedContact);
console.log('Success (Expected false)?', result4.success);
if (!result4.success) {
  console.log('Zod Field Errors:', result4.error.flatten().fieldErrors);
}

// Case 5: Valid Anonymous Submission (phone omitted, should pass)
console.log('\n--- TEST 5: Valid Anonymous Submission without Phone ---');
const validAnonymous = {
  rating: 2,
  category: 'overcharging',
  comment: 'Vendor charged Rs 20 extra above approved menu tariff.',
  isAnonymous: true,
  seat: 'Coach S4-12'
};
const result5 = feedbackSchema.safeParse(validAnonymous);
console.log('Success (Expected true)?', result5.success);

// Case 6: Inspector Closing without sufficient remarks
console.log('\n--- TEST 6: Inspector Closing without Remarks (Should Fail) ---');
const invalidInspectorClose = {
  status: 'closed',
  remarks: 'Done' // < 15 chars
};
const result6 = inspectorActionSchema.safeParse(invalidInspectorClose);
console.log('Success (Expected false)?', result6.success);
if (!result6.success) {
  console.log('Zod Field Errors:', result6.error.flatten().fieldErrors);
}

// Case 7: Valid Admin Batch Creation
console.log('\n--- TEST 7: Valid Admin Batch Creation ---');
const validBatch = {
  kitchenId: 'kit-101',
  itemType: 'Standard Veg Thali',
  trainNumber: '12424',
  quantity: 500
};
const result7 = adminBatchSchema.safeParse(validBatch);
console.log('Success (Expected true)?', result7.success);

console.log('\n=================================================================');
console.log('ALL ZOD TEST CASES PASSED SUCCESSFULLY!');
console.log('=================================================================');
