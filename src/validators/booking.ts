import { z } from 'zod'

export const createBookingSchema = z.object({
  slot_id: z.string().uuid('Invalid slot ID'),
  booking_type: z.enum(['free_call']).default('free_call'),
  context_college_id: z.string().uuid().nullable().optional(),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  preferred_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be HH:MM'),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled']),
  admin_notes: z.string().max(1000).optional(),
  cancellation_reason: z.string().max(500).optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
