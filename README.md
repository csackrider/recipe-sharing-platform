# Recipe Share

A community recipe-sharing platform built with Next.js, Drizzle ORM, and NextAuth.js.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite via better-sqlite3 + Drizzle ORM
- **Auth:** NextAuth.js v5 (credentials provider, JWT sessions)
- **Styling:** Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **Language:** TypeScript
- **Testing:** Playwright (multi-browser, multi-device E2E)
- **CI/CD:** GitHub Actions

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Generate a secret for NextAuth:

```bash
openssl rand -base64 32
```

Paste the value as `AUTH_SECRET` in `.env.local`.

### 3. Set up the database

```bash
npm run db:push
npm run db:seed
```

This creates the SQLite database at `data/recipe-share.db` and seeds it with sample users and recipes.

**Seeded test accounts:**

| Email | Password |
|---|---|
| chad.sackrider@outlook.com | test1234 |
| testuser@test.com | Test1234 |

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Drizzle Studio (database browser) |
| `npm run test` | Run Playwright E2E tests |
| `npm run test:ui` | Run Playwright tests with UI |
| `npm run test:unit` | Run Vitest unit tests (once) |
| `npm run test:unit:watch` | Run Vitest in watch mode |

## Testing

### Unit tests (Vitest)

Validates Zod schemas in `lib/validations/`, `cn()` in `lib/utils.ts`, and other pure logic. No database or browser required.

```bash
npm run test:unit
# or watch mode during development
npm run test:unit:watch
```

Tests live under `tests/unit/**/*.test.ts`. Configuration: `vitest.config.mjs`.

### E2E tests (Playwright)

```bash
# Set up the test environment
cp tests/.env.test.example tests/.env.test

# Make sure the database is seeded
npm run db:push
npm run db:seed

# Install Playwright browsers
npx playwright install --with-deps chromium webkit

# Run all E2E tests
npm run test

# Run Playwright with UI
npm run test:ui
```

### Test Projects

Tests run across multiple browser/device configurations:

| Project | Device | Browser |
|---|---|---|
| `chromium` | Desktop | Chrome |
| `chromium-auth` | Desktop | Chrome (auth-specific tests) |
| `android` | Pixel 7 | Chromium |
| `iphone` | iPhone 14 | WebKit |
| `ipad` | iPad (gen 7) | WebKit |

### CI/CD

GitHub Actions workflows (see `.github/workflows/`):

| Workflow | When | What |
|---|---|---|
| `smoke.yml` | Pull request to `dev` | **Unit tests** job (Vitest), then **smoke tests** job (Playwright `@smoke`), then auto-merge if green (same-repo PRs only) |
| `full-suite.yml` | After smoke succeeds, or PR to `main` | **Unit tests** job, then **full E2E** job (Playwright); promotes `dev` → `main` when triggered by smoke |

HTML reports are uploaded as artifacts. On failure, test results (screenshots, traces) are also uploaded.

**Public repo / branch protection:** See [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md) for required status check names and security settings.

## Project Structure

```
app/                    # Next.js App Router pages
  auth/                 # Login & signup pages
  recipes/              # Recipe CRUD pages
  profile/              # Profile pages
  api/                  # API routes (auth, upload)
components/             # React components
  auth/                 # LoginForm, SignupForm, SignOutButton
  layout/               # Navbar
  recipes/              # RecipeForm, LikeButton, SaveButton, etc.
  profile/              # EditProfileForm, ChangePasswordForm
lib/
  db/                   # Drizzle schema, connection, seed
  actions/              # Server Actions (auth, recipes, interactions, profile)
  validations/          # Zod schemas
  auth.ts               # NextAuth configuration (full, with providers)
  auth.config.ts        # NextAuth configuration (edge-safe, for middleware)
  utils.ts              # Utility functions
types/                  # TypeScript type definitions
data/                   # SQLite database (gitignored)
public/uploads/         # Uploaded images (gitignored)
tests/
  unit/                 # Vitest unit tests (*.test.ts)
  specs/                # Playwright spec files
  pages/                # Page Object Model classes
  fixtures/             # Playwright fixtures (authenticated sessions)
  helpers/              # Playwright test data helpers
drizzle/                # Generated migration files
.github/workflows/      # smoke.yml, full-suite.yml
proxy.ts                # Next.js 16 middleware (route protection)
```
