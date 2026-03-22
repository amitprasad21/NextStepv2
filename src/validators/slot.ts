import { z } from 'zod'

export const createSlotSchema = z.object({
  slot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  slot_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be HH:MM'),
  max_capacity: z.number().int().positive().default(1),
})

export const bulkCreateSlotsSchema = z.object({
  slots: z.array(createSlotSchema).min(1).max(50),
})

export const updateSlotSchema = z.object({
  is_available: z.boolean().optional(),
  max_capacity: z.number().int().positive().optional(),
})

export type CreateSlotInput = z.infer<typeof createSlotSchema>
export type BulkCreateSlotsInput = z.infer<typeof bulkCreateSlotsSchema>
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>
