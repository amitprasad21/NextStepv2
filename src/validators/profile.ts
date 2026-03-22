import { z } from 'zod'

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(150),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  marks_10th: z.number().min(0).max(100, 'Must be between 0 and 100'),
  marks_12th: z.number().min(0).max(100).nullable().optional(),
  appearing_12th: z.boolean().default(false),
  jee_rank: z.number().int().positive().nullable().optional(),
  desired_course: z.string().min(1, 'Desired course is required').max(100),
  desired_branch: z.string().max(100).nullable().optional(),
  stream: z.enum(['UG', 'PG']),
})

export const profileUpdateSchema = profileSchema.partial()

export type ProfileInput = z.infer<typeof profileSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

/**
 * Determines is_complete based on PRD rules:
 * - full_name, marks_10th, desired_course, stream, city, state — all NOT NULL
 * - marks_12th NOT NULL OR appearing_12th = true
 * - jee_rank and desired_branch are OPTIONAL
 */
export function computeIsComplete(data: ProfileInput): boolean {
  const hasRequired =
    !!data.full_name &&
    data.marks_10th != null &&
    !!data.desired_course &&
    !!data.stream &&
    !!data.city &&
    !!data.state

  const has12th = data.marks_12th != null || data.appearing_12th === true

  return hasRequired && has12th
}
