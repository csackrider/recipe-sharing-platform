import { z } from 'zod'

export const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  cooking_time: z.coerce
    .number({ error: 'Cooking time must be a number' })
    .min(1, 'Cooking time must be at least 1 minute')
    .max(1440, 'Cooking time cannot exceed 1440 minutes'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    error: 'Please select a difficulty',
  }),
  category: z.string().max(50).optional(),
  ingredients: z
    .array(z.string().min(1, 'Ingredient cannot be empty'))
    .min(1, 'Add at least one ingredient'),
})

export type RecipeFormValues = z.infer<typeof recipeSchema>
