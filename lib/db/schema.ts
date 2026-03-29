import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const recipes = sqliteTable('recipes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  ingredients: text('ingredients', { mode: 'json' }).notNull().$type<string[]>(),
  instructions: text('instructions').notNull(),
  cookingTime: integer('cooking_time').notNull().default(0),
  difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }).notNull(),
  category: text('category'),
  imageUrl: text('image_url'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const likes = sqliteTable('likes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('likes_user_recipe_idx').on(table.userId, table.recipeId),
])

export const savedRecipes = sqliteTable('saved_recipes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('saved_recipes_user_recipe_idx').on(table.userId, table.recipeId),
])
