'use client'

import { useRef, useState, useTransition } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
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
  defaultImageUrl?: string | null
}

export default function RecipeForm({ recipeId, defaultValues, defaultImageUrl }: RecipeFormProps) {
  const isEditing = !!recipeId
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Image state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [clearExisting, setClearExisting] = useState(false)

  const currentDisplayUrl = selectedFile ? previewUrl : (clearExisting ? null : defaultImageUrl ?? null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: { ingredients: [''], ...defaultValues },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-expect-error useFieldArray expects object fields; string arrays work fine at runtime
    name: 'ingredients',
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setServerError('Only JPG, PNG, and WebP images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setServerError('Image must be under 5 MB.')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setClearExisting(false)
    setServerError(null)
  }

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
    setClearExisting(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = (data: RecipeFormValues) => {
    setServerError(null)
    startTransition(async () => {
      let imageUrl: string | null = clearExisting ? null : (defaultImageUrl ?? null)

      if (selectedFile) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setServerError('You must be logged in.'); return }

        const ext = selectedFile.name.split('.').pop() ?? 'jpg'
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(path, selectedFile, { upsert: true })

        if (uploadError) {
          setServerError('Failed to upload image. Please try again.')
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(path)

        imageUrl = publicUrl
      }

      const result = isEditing
        ? await updateRecipe(recipeId, data, imageUrl)
        : await createRecipe(data, imageUrl ?? undefined)

      if (result?.error) setServerError(result.error)
    })
  }

  const fieldClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400',
      'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
      hasError ? 'border-red-400' : 'border-zinc-200'
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Cover image */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Cover image</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        {currentDisplayUrl ? (
          <div className="relative h-48 w-full overflow-hidden rounded-xl border border-zinc-200">
            <Image
              src={currentDisplayUrl}
              alt="Cover"
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
            <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/40 to-transparent p-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-white"
              >
                Change photo
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="rounded-full bg-white/90 p-1.5 text-zinc-700 hover:bg-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-400 transition-colors hover:border-orange-300 hover:text-orange-500"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">Add cover photo</span>
            <span className="text-[11px]">JPG, PNG or WebP · max 5 MB</span>
          </button>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          id="title"
          placeholder="e.g. One-Pot Creamy Tomato Pasta"
          className={fieldClass(!!errors.title)}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
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
            className={fieldClass(!!errors.cooking_time)}
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
            className={fieldClass(!!errors.difficulty)}
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
                className={fieldClass(!!errors.ingredients?.[index])}
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
          className={cn(fieldClass(!!errors.instructions), 'resize-y')}
        />
        {errors.instructions && (
          <p className="mt-1 text-xs text-red-500">{errors.instructions.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5',
          'text-sm font-medium text-white shadow-sm',
          'hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {selectedFile ? 'Uploading & saving…' : isEditing ? 'Saving changes…' : 'Saving recipe…'}
          </>
        ) : (
          isEditing ? 'Save changes' : 'Save recipe'
        )}
      </button>
    </form>
  )
}
