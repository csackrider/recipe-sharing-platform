# Playwright Test Suite — Recipe Sharing App

Follow the `playwright-test-automation` skill for all conventions:
Page Object Model, fixture usage, assertion methods on Page Objects,
locator strategy, directory structure, and config baseline.

---

## Step 1 — Read these files before writing any code

Understanding these files first ensures generated tests match the actual
app — correct field names, validation rules, and route behavior.

- `app/` directory — all routes and their protection status
- `proxy.ts` — middleware: which routes are protected and redirect behavior
- `lib/validations/auth.ts` — login and password change validation rules
- `lib/validations/recipe.ts` — recipe form validation rules
- `lib/validations/profile.ts` — profile form validation rules
- `types/database.ts` — table schemas and field types
- `lib/actions/auth.ts` — confirms login always redirects to `/` (line 30)
- `components/recipes/DeleteRecipeButton.tsx` — two-step delete confirmation UI
- `components/recipes/LikeButton.tsx` — optimistic like toggle behavior
- `components/recipes/SaveButton.tsx` — optimistic save toggle behavior

---

## Step 2 — App overview

**Stack:** Next.js 16 (App Router), Drizzle ORM + SQLite, NextAuth.js, Tailwind CSS
**Base URL:** `http://localhost:3000`
**Description:** A recipe sharing platform where users can create, browse,
like, and save recipes, and manage their profile.

---

## Step 3 — Routes map

### Public (no auth required)
| Route | Description |
|---|---|
| `/` | Home / landing page |
| `/recipes` | Recipe feed with search (`?q=`) and filters (`?category=` `?difficulty=`) |
| `/recipes/[id]` | Recipe detail — like and save buttons visible |
| `/auth/login` | Login form |
| `/auth/signup` | Signup form |
| `/profile/[username]` | Public user profile |

### Protected (middleware redirects unauthenticated users to `/auth/login`)
| Route | Description |
|---|---|
| `/recipes/new` | Create recipe form |
| `/recipes/[id]/edit` | Edit recipe — also owner-only |
| `/profile/me` | Personal profile — My Recipes and Saved tabs |

**Known behavior:** After login the app always redirects to `/` regardless
of the `?redirectTo=` param in the URL. This is a known gap — do not write
a test asserting redirectTo behavior.

---

## Step 4 — Test coverage

### Smoke (`smoke.spec.ts`)
Verify each public route loads without error:
- `/`
- `/recipes`
- `/recipes/[id]` — use a real recipe ID from the database or create one in setup
- `/auth/login`
- `/auth/signup`
- `/profile/[username]` — use TEST_USER's username

### Authentication (`auth.spec.ts`)
**Happy path (unauthenticated):**
- Valid credentials → redirects to `/`

**Sad paths (unauthenticated):**
- Wrong password → error message visible
- Invalid email format → validation error visible
- Empty form submission → validation error visible

**Logged-in user:**
- Already logged-in user navigates to `/auth/login` → not on `/auth/login`
- Sign out → lands on `/auth/login`, navbar no longer shows user email

### Recipe Feed (`recipes-feed.spec.ts`)
- Search by keyword → URL contains `?q=`, results list updates
- Filter by category → URL contains `?category=`, results update
- Filter by difficulty → URL contains `?difficulty=`, results update
- Combined keyword + category + difficulty → URL contains all three params, results update
- Filters that produce no results → empty state message visible
- Click "Clear filters" → URL has no query params, full results restore

### Recipe CRUD (`recipe-crud.spec.ts`)
All tests in this file use `auth.fixture` (authenticated user).

**Create:**
- Submit valid form without image → redirected to new recipe detail page
- Submit valid form with image (`tests/resources/images/test-image.jpg`) → recipe detail displays uploaded image
- Title under 3 characters → validation error visible
- No difficulty selected → validation error visible
- Empty ingredient field → validation error visible
- Instructions under 10 characters → validation error visible

**Edit:**
- Owner edits their recipe → changes saved, detail page reflects updated values
- Second logged-in user (TEST_USER_2) navigates directly to owner's edit URL → redirected away from edit page

**Delete:**
- Owner confirms delete → recipe removed, redirected to `/recipes`
- Owner opens delete confirmation then cancels → remains on recipe detail page, recipe still present

### Recipe Detail — Interactions (`recipe-detail.spec.ts`)
Use a known recipe for all interaction tests.

**Like button:**
- Logged-in user clicks like → count increments by 1, button shows filled state
- Logged-in user clicks like again (toggle off) → count decrements by 1, button returns to unfilled state
- Logged-out user clicks like → redirected to `/auth/login`

**Save button:**
- Logged-in user clicks save → button shows "Saved" state
- Logged-in user clicks save again (toggle off) → button returns to unsaved state
- Logged-out user clicks save → redirected to `/auth/login`

### Profile (`profile.spec.ts`)
All tests use `auth.fixture`.

**Edit profile:**
- Update display name and bio → saved confirmation visible, values persist after page reload

**Change password:**
- Valid new password (min 8 chars, matching confirm) → success confirmation visible
- Password under 8 characters → validation error visible
- Passwords do not match → validation error visible

**Saved tab:**
- User with a saved recipe → recipe card appears under the Saved tab
- User with no saved recipes → empty state message visible

### Public Profile (`public-profile.spec.ts`)
- Navigate to a valid `/profile/[username]` → username, recipe count, and recipe grid all visible
- Navigate to `/profile/usernamedoesnotexist` → error / not-found state visible

### Auth Guards (`auth-guards.spec.ts`)
Single parameterized test that loops through all protected routes.
For each of `/recipes/new`, `/recipes/some-id/edit`, `/profile/me`:
- Unauthenticated user navigates to route → redirected to `/auth/login`

---

## Step 5 — Test environment

Credentials are stored in `tests/.env.test` (git-ignored).
Expose `tests/.env.test.example` with placeholder values.

Required env vars:
```
BASE_URL=http://localhost:3000
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
TEST_USER_USERNAME=        # the username slug for /profile/[username] smoke test
TEST_USER_2_EMAIL=         # second user for owner-vs-visitor tests
TEST_USER_2_PASSWORD=
```

**Two seeded database users are required** (run `npm run db:seed`). Tests
do not create or delete user accounts. Signup is out of scope.

---

## Step 6 — Output specification

Generate every file in this list. Do not skip any.

```
playwright.config.ts
tests/.env.test.example
tests/fixtures/auth.fixture.ts          # single authenticated page
tests/fixtures/multi-user.fixture.ts    # ownerPage + visitorPage for owner-vs-visitor tests
tests/pages/BasePage.ts
tests/pages/LoginPage.ts
tests/pages/RecipesPage.ts
tests/pages/RecipeDetailPage.ts
tests/pages/RecipeFormPage.ts
tests/pages/ProfileMePage.ts
tests/pages/PublicProfilePage.ts
tests/specs/smoke.spec.ts
tests/specs/auth.spec.ts
tests/specs/recipes-feed.spec.ts
tests/specs/recipe-crud.spec.ts
tests/specs/recipe-detail.spec.ts
tests/specs/profile.spec.ts
tests/specs/public-profile.spec.ts
tests/specs/auth-guards.spec.ts
tests/helpers/test-data.ts
```

---

## Step 7 — Constraints

- **No signup tests** — do not create user accounts in any test; rely on seeded data
- **No email delivery tests** — no email confirmation flow exists
- **`redirectTo` param is not honored** — login always goes to `/`; do not assert post-login redirect to any page other than `/`
- **No hard waits** — never use `page.waitForTimeout()`; rely on Playwright auto-wait
- **No raw `expect()` in spec files** — all assertions must be methods on the Page Object
- **Locator priority** — `getByRole` and `getByLabel` first; CSS class selectors never
- **`fullyParallel: true`** — every test must be fully independent with no shared mutable state
