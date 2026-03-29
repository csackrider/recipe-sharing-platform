# Branch protection and public repo security

Use this when making the repository **public** while keeping automation safe.

## 1. GitHub Actions settings (before or after going public)

**Settings → Actions → General**

1. **Fork pull request workflows**  
   Choose **Require approval for all outside collaborators** (or stricter).  
   This adds a manual gate if anything still tries to run from a fork.

2. **Workflow permissions**  
   Keep **Read repository contents and packages permissions** as default, and only grant **Read and write** where needed (this repo’s workflows set job-level permissions where possible).

3. **Allow GitHub Actions to create and approve pull requests**  
   Turn **on** if you use the promote / merge steps (already required for this project).

## 2. Branch protection / rulesets

Use **Settings → Rules → Rulesets** (recommended) or **Settings → Branches → Branch protection rules**.

### Branch `dev`

| Rule | Recommendation |
|------|------------------|
| Require a pull request before merging | **On** (no direct pushes) |
| Require status checks to pass | **On** |
| Required checks | Add exactly: **`Smoke Tests / Run smoke tests`** |
| Require branches up to date before merging | **Off** (avoids races with rapid merges) |
| Require review / approvals | **Off** unless you want manual approval (blocks bot auto-merge unless you add bypass) |
| Allow bypass for GitHub Actions | Optional: add if you later require reviews |

**Important:** Only require the **smoke test** job, not **Auto-merge to dev**. The smoke job finishes first and turns the check green; then the merge job runs.

### Branch `main`

| Rule | Recommendation |
|------|------------------|
| Require a pull request before merging | **On** |
| Require status checks to pass | **Optional** — see below |
| Required checks | If enabled: **`Full E2E Suite / Run full E2E suite`** only (not the merge/promote jobs) |

**Promote flow caveat:** The workflow that merges `dev` → `main` runs the full suite on `dev`, then opens and merges the promotion PR in the same run. That PR may not show the same check names as a normal PR. If merges are blocked:

- **Option A:** Do **not** require status checks on `main` (still require PR + no force-push). Quality is enforced by the full suite on `dev` before promote.
- **Option B:** In the ruleset, **add an exception / bypass** for **GitHub Actions** (or `github-actions[bot]`) so the promote merge can complete.
- **Option C:** Require checks only for **human** PRs to `main` and use bypass for Actions (rulesets support actors).

### Extra hardening

- **Restrict who can push**: Only your account (or org team) as **Admin/Write**; everyone else has read-only on a public repo.
- **Do not** add repository secrets that are needed for untrusted workflows; fork PRs already get a restricted token, but keeping secrets minimal is still best practice.

## 3. Making the repository public

**Settings → General → Danger zone → Change repository visibility**

After switching to public, re-check **Actions** and **Rules** as above.

## 4. Status check names (for copy-paste)

These names match the workflow `name:` and job `name:` in this repo:

| Branch | Required status check name |
|--------|----------------------------|
| `dev` | `Smoke Tests / Run smoke tests` |
| `main` | `Full E2E Suite / Run full E2E suite` (if you use required checks) |

If GitHub shows a slightly different label, pick the entry that matches the **smoke** or **full** test job only—not auto-merge or promote.

## 5. How workflows enforce “same repo only”

Pull request workflows run **only** when the PR head branch is in **this** repository (`head.repo.full_name == github.repository`). Pull requests **from forks** hit a small failing job with a clear error and do **not** run Playwright (saves minutes and avoids abuse).
