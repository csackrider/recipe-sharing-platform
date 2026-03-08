'use client'

import { useState, useTransition } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { createRecipe, updateRecipe } from '@/lib/actions/recipes'
import { recipeSchema, type RecipeFormValues } from '@/lib/validations/recipe'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Breakfast', 'Lunch', 'Dinner', 'Dessert',
  'Snack', 'Soup', 'Salad', 'Vegan', 'Quick & Easy',
]

interface RecipeFormProps {
  recipeId?: string
  defaultValues?: Partial<RecipeFormValues>
}

export default function RecipeForm({ recipeId, defaultValues }: RecipeFormProps) {
  const isEditing = !!recipeId
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [''],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-expect-error useFieldArray expects object fields; string arrays work fine at runtime
    name: 'ingredients',
  })

  const onSubmit = (data: RecipeFormValues) => {
    setServerError(null)
    startTransition(async () => {
      const result = isEditing
        ? await updateRecipe(recipeId, data)
        : await createRecipe(data)
      if (result?.error) setServerError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          id="title"
          placeholder="e.g. One-Pot Creamy Tomato Pasta"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
            errors.title ? 'border-red-400' : 'border-zinc-200'
          )}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="cooking_time" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Cook time (mins) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('cooking_time')}
            id="cooking_time"
            type="number"
            min={1}
            placeholder="30"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400',
              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
              errors.cooking_time ? 'border-red-400' : 'border-zinc-200'
            )}
          />
          {errors.cooking_time && (
            <p className="mt-1 text-xs text-red-500">{errors.cooking_time.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="difficulty" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <select
            {...register('difficulty')}
            id="difficulty"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900',
              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
              errors.difficulty ? 'border-red-400' : 'border-zinc-200'
            )}
          >
            <option value="">Select…</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          {errors.difficulty && (
            <p className="mt-1 text-xs text-red-500">{errors.difficulty.message}</p>
          )}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Category
          </label>
          <select
            {...register('category')}
            id="category"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">None</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700">
            Ingredients <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => append('')}
            className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add ingredient
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                {...register(`ingredients.${index}` as const)}
                placeholder={`e.g. ${index === 0 ? '2 cups flour' : index === 1 ? '1 tsp salt' : 'ingredient'}`}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                  errors.ingredients?.[index] ? 'border-red-400' : 'border-zinc-200'
                )}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.ingredients && !Array.isArray(errors.ingredients) && (
          <p className="mt-1 text-xs text-red-500">{errors.ingredients.message}</p>
        )}
      </div>

      {/* Instructions */}
      <div>
        <label htmlFor="instructions" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Instructions <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('instructions')}
          id="instructions"
          rows={6}
          placeholder="Describe the steps to make this recipe…"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y',
            errors.instructions ? 'border-red-400' : 'border-zinc-200'
          )}
        />
        {errors.instructions && (
          <p className="mt-1 text-xs text-red-500">{errors.instructions.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'flex flex-1 items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5',
            'text-sm font-medium text-white shadow-sm',
            'hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Saving changes…' : 'Saving recipe…'}
            </>
          ) : (
            isEditing ? 'Save changes' : 'Save recipe'
          )}
        </button>
      </div>
    </form>
  )
}
