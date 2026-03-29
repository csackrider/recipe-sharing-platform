import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import * as schema from './schema'

const DB_PATH = path.join(process.cwd(), 'data', 'recipe-share.db')
const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

const db = drizzle(sqlite, { schema })

async function seed() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('test1234', 12)

  const existingUsers = db.select().from(schema.users).all()
  if (existingUsers.length > 0) {
    console.log('Users already exist, skipping seed.')
    sqlite.close()
    return
  }

  const user1Results = db
    .insert(schema.users)
    .values({
      email: 'chad.sackrider@outlook.com',
      passwordHash,
      username: 'chadsackrider',
      displayName: 'Chad Sackrider',
    })
    .returning()
    .all()
  const user1 = user1Results[0]

  const passwordHash2 = await bcrypt.hash('Test1234', 12)
  const user2Results = db
    .insert(schema.users)
    .values({
      email: 'testuser@test.com',
      passwordHash: passwordHash2,
      username: 'testuser',
      displayName: 'Test User',
    })
    .returning()
    .all()
  const user2 = user2Results[0]

  const sampleRecipes = [
    {
      userId: user1.id,
      title: 'Classic Margherita Pizza',
      ingredients: ['2 cups flour', '1 cup warm water', '1 tsp yeast', '1 tsp salt', '1 cup tomato sauce', '8 oz fresh mozzarella', 'Fresh basil leaves'],
      instructions: 'Mix flour, water, yeast, and salt to form dough. Let rise for 1 hour.\nPreheat oven to 475°F.\nStretch dough into a circle on a floured surface.\nSpread tomato sauce evenly.\nTear mozzarella and distribute over pizza.\nBake for 10-12 minutes until crust is golden.\nTop with fresh basil and serve immediately.',
      cookingTime: 90,
      difficulty: 'medium' as const,
      category: 'Dinner',
    },
    {
      userId: user1.id,
      title: 'Quick Avocado Toast',
      ingredients: ['2 slices sourdough bread', '1 ripe avocado', '1 tbsp lemon juice', 'Salt and pepper to taste', 'Red pepper flakes', '2 eggs (optional)'],
      instructions: 'Toast the sourdough bread until golden and crispy.\nHalve the avocado, remove the pit, and scoop into a bowl.\nMash with a fork, adding lemon juice, salt, and pepper.\nSpread the avocado mixture on the toast.\nTop with red pepper flakes and a fried egg if desired.',
      cookingTime: 10,
      difficulty: 'easy' as const,
      category: 'Breakfast',
    },
    {
      userId: user2.id,
      title: 'Thai Green Curry',
      ingredients: ['400ml coconut milk', '2 tbsp green curry paste', '500g chicken thigh', '1 cup bamboo shoots', '1 cup Thai basil', '2 tbsp fish sauce', '1 tbsp palm sugar'],
      instructions: 'Heat a splash of coconut milk in a wok until it splits.\nAdd curry paste and fry for 2 minutes until fragrant.\nAdd chicken and cook until sealed on all sides.\nPour in remaining coconut milk and bring to a simmer.\nAdd bamboo shoots, fish sauce, and palm sugar.\nSimmer for 15 minutes until chicken is cooked through.\nStir in Thai basil and serve over jasmine rice.',
      cookingTime: 35,
      difficulty: 'medium' as const,
      category: 'Dinner',
    },
  ]

  db.insert(schema.recipes).values(sampleRecipes).execute()

  console.log('Seeded 2 users and 3 recipes.')
  sqlite.close()
}

seed().catch(console.error)
