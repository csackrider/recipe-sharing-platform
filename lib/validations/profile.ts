import { z } from 'zod'

export const profileSchema = z.object({
  display_name: z
    .string()
    .max(50, 'Display name must be 50 characters or less')
    .optional(),
  bio: z
    .string()
    .max(200, 'Bio must be 200 characters or less')
    .optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
