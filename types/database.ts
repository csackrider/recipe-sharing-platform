import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type { users, recipes, likes, savedRecipes } from '@/lib/db/schema'

export type User = InferSelectModel<typeof users>
export type UserInsert = InferInsertModel<typeof users>

export type Recipe = InferSelectModel<typeof recipes>
export type RecipeInsert = InferInsertModel<typeof recipes>
export type RecipeUpdate = Partial<Omit<RecipeInsert, 'id'>>

export type Like = InferSelectModel<typeof likes>
export type SavedRecipe = InferSelectModel<typeof savedRecipes>

export type Profile = Pick<User, 'id' | 'username' | 'displayName' | 'bio' | 'avatarUrl' | 'createdAt'>
