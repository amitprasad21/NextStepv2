import { z } from 'zod'

export const createVisitSchema = z.object({
  college_id: z.string().uuid('Invalid college ID'),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  visit_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be HH:MM').nullable().optional(),
})

export const updateVisitStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled']),
  admin_notes: z.string().max(1000).optional(),
  cancellation_reason: z.string().max(500).optional(),
})

export type CreateVisitInput = z.infer<typeof createVisitSchema>
export type UpdateVisitStatusInput = z.infer<typeof updateVisitStatusSchema>
