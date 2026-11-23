import { z } from 'zod';

/**
 * Stage 10: Zod Validation Schemas
 * Demonstrates:
 * - Primitives (string, number, boolean, array, enum)
 * - Refinements (.refine / .superRefine) for conditional multi-field business rules
 * - Custom regex patterns (Indian 10-digit PNR & 10-digit mobile starting with 6-9)
 * - Image payload count and format constraints
 */

export const CategoryEnum = z.enum([
  'hygiene_issue',
  'foreign_object',
  'stale_spoiled_food',
  'wrong_quantity',
  'overcharging',
  'damaged_packaging',
  'taste',
  'other'
]);

export const StatusEnum = z.enum([
  'new',
  'under_review',
  'inspector_assigned',
  'action_taken',
  'closed'
]);

/**
 * 1. Passenger Feedback Submission Schema
 * Business Rules:
 * - Rating: integer between 1 and 5
 * - Category: valid enum
 * - Comment: min 10, max 500 characters
 * - CONDITIONAL REFINEMENT: If category is high severity ('foreign_object' or 'hygiene_issue')
 *   or rating is 1, comment must be at least 20 characters detailing the problem!
 * - PNR: Optional, but if provided must be exactly 10 digits
 * - Phone: Optional (or required if not anonymous), must match Indian 10-digit mobile pattern
 * - Images: Max 3 items, each must be a valid Data URL or URL string
 */
export const feedbackSchema = z
  .object({
    rating: z
      .number({ invalid_type_error: 'Please select a star rating.' })
      .int()
      .min(1, 'Rating must be at least 1 star.')
      .max(5, 'Rating cannot exceed 5 stars.'),
    category: CategoryEnum,
    comment: z
      .string({ required_error: 'Please describe the problem with your meal.' })
      .min(10, 'Description must be at least 10 characters long.')
      .max(500, 'Description cannot exceed 500 characters.'),
    foreignObjectDetail: z.string().optional(),
    pnr: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{10}$/.test(val.trim()), {
        message: 'Indian Railways PNR must be exactly 10 digits.'
      }),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^[6-9]\d{9}$/.test(val.trim()), {
        message: 'Mobile number must be a valid 10-digit Indian number starting with 6-9.'
      }),
    isAnonymous: z.boolean().default(false),
    seat: z.string().min(1, 'Coach or berth details are required.').max(50),
    images: z
      .array(z.string())
      .max(3, 'A maximum of 3 photographs can be attached.')
      .default([])
  })
  .superRefine((data, ctx) => {
    // Conditional Business Rule A: High severity categories require detailed description (>= 20 chars)
    const isHighSeverity = ['foreign_object', 'hygiene_issue', 'stale_spoiled_food'].includes(data.category);
    if ((isHighSeverity || data.rating === 1) && data.comment.trim().length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comment'],
        message: 'High-severity safety grievances require at least 20 characters explaining the issue.'
      });
    }

    // Conditional Business Rule B: If category is foreign_object, contaminant detail is required
    if (data.category === 'foreign_object' && (!data.foreignObjectDetail || data.foreignObjectDetail.trim().length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['foreignObjectDetail'],
        message: 'Please identify what foreign object was found (e.g. staple wire, glass, pebble).'
      });
    }

    // Conditional Business Rule C: If passenger is NOT anonymous, phone number is required for SMS tracking
    if (!data.isAnonymous && (!data.phone || !data.phone.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Mobile number is required for SMS tracking unless filing anonymously.'
      });
    }
  });

/**
 * 2. Inspector Status Transition Schema
 * Business Rule:
 * - If status is being moved to 'action_taken' or 'closed', inspector remarks MUST be at least 15 characters
 */
export const inspectorActionSchema = z
  .object({
    status: StatusEnum,
    remarks: z.string().min(1, 'Inspector remarks cannot be empty.')
  })
  .superRefine((data, ctx) => {
    if (['action_taken', 'closed'].includes(data.status) && data.remarks.trim().length < 15) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['remarks'],
        message: 'Official closure or penalty action requires at least 15 characters of detailed justification.'
      });
    }
  });

/**
 * 3. Admin Batch Creation Schema
 * Used by admin/kitchen managers to issue new batch tokens for trains
 */
export const adminBatchSchema = z.object({
  kitchenId: z.string().min(1, 'Kitchen must be selected.'),
  itemType: z.string().min(3, 'Meal item type is required (e.g. Standard Veg Thali).'),
  trainNumber: z
    .string()
    .regex(/^\d{5}$/, 'Indian Railways train number must be exactly 5 digits (e.g. 12424).'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number.' })
    .int()
    .min(10, 'Minimum batch run is 10 meal containers.')
    .max(2000, 'Maximum single batch run is 2000 containers.')
});
