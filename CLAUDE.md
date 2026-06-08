# ilipro — Project Guide

Admin SaaS for managing companies, projects, clients, and licenses.

## Stack

- **Front** : React + TypeScript + Vite + Tailwind + React Query + React Router
- **Back** : NestJS + TypeScript + Prisma + PostgreSQL

---

## Frontend Architecture

### Folder structure

```
src/
  api/              ← data layer: React Query hooks + types, split by domain
  lib/              ← pure utilities, constants, config — no hooks, no business types
  hooks/            ← generic UI hooks shared across unrelated consumers
  components/       ← business components shared across pages
  pages/            ← page-scoped code, colocated with its hooks
  contexts/
```

### `api/` — data layer

One file per business domain. Types and hooks live together in the same file.

```
api/
  companies.ts      ← Company type, useCompanies(), useCompany(), mutations
  users.ts          ← User type, useUsers(), useUser(), mutations
  licenses.ts       ← License type, useLicense(), mutations
  projects.ts       ← Project type, useProjects(), mutations
```

Never put business types or React Query hooks in `lib/`.

### `lib/` — pure utilities

No hooks. No business types. Only:
- `api.ts` — fetch/axios config
- `licenseConstants.ts` — static maps and labels
- `toast.ts` — toast helpers
- `utils.ts` — generic functions

### `hooks/` — shared UI hooks

Only hooks that are truly generic and reused by unrelated consumers.
Examples: `useCarousel`, `useClipboard`, `usePageTitle`.

Business hooks do not belong here — they live colocated with their component or page.

### `components/` — shared business components

Components used by more than one page. Split into:

```
components/
  ui/               ← zero business knowledge (Button, Input, Modal, Badge, Spinner…)
  LicenseBadge.tsx
  VersionBadge.tsx
  layouts/
    AdminLayout.tsx
    UserLayout.tsx
  licenseModal/
  licensePanel/
  projectCard/
  sidebar/
```

#### `ui/` — design system primitives

No imports from `api/`, `lib/` business files, or domain types.
These are the building blocks: `Button`, `Input`, `Modal`, `ConfirmDialog`, `FileDropZone`, `EmptyText`, `LoadingText`, `BackLink`.

### `pages/` — page-scoped code

Each page owns its sub-components and hooks. The folder hierarchy reflects the visual complexity of the page.

```
pages/
  admin/
    companies/
    companyDetail/
      CompanyDetailPage.tsx   ← entry point at root
      useRenameCompany.ts     ← colocated hook
      project/
      users/
        useLinkUser.ts
        useManageUsers.ts
        userCard/
    userDetail/
      UserDetailPage.tsx
      useEditUser.ts
      company/
        license/
        project/
    users/
  user/
    userDetail/               ← deliberate copy, independent from admin/userDetail
  login/
    useLogin.ts
```

---

## File size and splitting

**Hard limit: no file should exceed ~100 lines.**

When a file grows beyond that, split it. The split should be semantic, not arbitrary.

### Option B — the standard split pattern

Every complex component follows the same structure:
- The **entry point** (`ComponentName.tsx`) stays at the root of its folder.
- Sub-components go into **semantically named subfolders** that reflect either the visual structure or the responsibility.

```
licenseModal/
  LicenseModal.tsx        ← entry point, visible immediately
  selectors/              ← form controls at the top of the modal
    LicenseTypeSelector.tsx
    LicenseStatusSelector.tsx
    LicenseProjectSelector.tsx
  typeFields/             ← conditional fields per license type
    LicenseFreeFields.tsx
    LicenseClassicFields.tsx
  machineLock/            ← complex section, may grow
    MachineLockSection.tsx
  actions/                ← bottom bar: simulate + save/cancel/revoke
    LicenseSimulate.tsx
    LicenseActions.tsx
```

Apply the same logic to `projectCard/`, `sidebar/`, etc.

### Hook colocation rule

A hook lives **as close as possible** to its only consumer.
It moves up one level only when a second unrelated consumer needs it.

| Scope | Where it lives |
|---|---|
| Used only by one component | Colocated in the component's folder |
| Used only by one page | Colocated in the page's folder |
| Used by a shared component (e.g. sidebar) | Inside that component's folder |
| Truly generic UI | `hooks/` |
| Data fetching | `api/<domain>.ts` |

---

## Duplication vs decoupling

Intentional duplication is preferred over forced DRY when two components serve different intents.

Example: `admin/userDetail` and `user/userDetail` look similar today but serve different purposes (admin edits, user reads). They must evolve independently — do not merge them.

> Incidental similarity ≠ conceptual identity.

---

## Naming conventions

- Folders: `camelCase` (`licenseModal/`, `projectCard/`)
- Components: `PascalCase` (`LicenseModal.tsx`)
- Hooks: `camelCase` prefixed with `use` (`useLicenseForm.ts`)
- The entry point of a folder always matches the folder name: `licenseModal/LicenseModal.tsx`

---

## Backend Architecture

### Stack update

- **Back** : NestJS + TypeScript + TypeORM + PostgreSQL

### Target structure

```
back/src/
  contracts/          ← DTOs + responses (shareable with front)
  auth/               ← unchanged
  shared/             ← everything cross-cutting
  adminDashboard/     ← admin CRUD
  userDashboard/      ← logged-in user read operations
  payment/            ← stripe
  system/             ← version
```

### Where logic lives

| File | Role |
|---|---|
| `.entity.ts` | TypeORM entity + object-level behaviors (`isExpired()`, `canActivate()`) |
| `.abstract-repo.ts` | Abstract class (not interface — survives compilation, usable as NestJS injection token). All application code depends only on this. Enables test mocking. |
| `.repo.ts` | Concrete implementation: basic DB operations, error handling (404, ConflictException), entity→response mapping, Cloudflare R2 access. No orchestration logic. |
| `.uc.ts` | Orchestration only — coordinates multiple repos, rules that span entities. **No .uc.ts if logic is a single repo call.** |
| `.model.ts` | Rich domain object when the TypeORM entity is insufficient — created only if needed. |
| `helpers/` | Pure functions with no NestJS dependency (slug, dates, formatting). |

**Dependency rule:**
```
controller → [uc →] abstract-repo ← repo (concrete, injected by NestJS)
                   ↘ helpers
                   ↘ entity (domain methods)
```

**Injection pattern:**
```ts
// abstract-repo: abstract class, not interface
export abstract class IUserRepo {
  abstract findById(id: string): Promise<UserEntity>;
}

// module: binds abstract to concrete
{ provide: IUserRepo, useClass: UserRepo }
```

**Shared endpoints — duplicate, don't share:**
Endpoints used by both admin and user contexts (e.g. `GET /users/slug/:slug`) are duplicated deliberately in each context. Same principle as front: incidental similarity ≠ conceptual identity.

---

### `shared/`

Everything cross-cutting. No business logic changes — pure file moves.

```
shared/
  domain/
    user.entity.ts
    company.entity.ts
    license.entity.ts
    project.entity.ts
  database/
    typeorm.config.ts       ← update paths to shared/domain/
    migrations/             ← never regenerate — DB history, unrelated to file paths
  storage/
    r2.service.ts
  guards/
    admin.guard.ts
    jwt-auth.guard.ts
  interceptors/
  helpers/
    slug.ts
    time.ts
```

Path aliases in `back/tsconfig.json`:
```json
"paths": {
  "@contracts/*": ["../contracts/*"],
  "@shared/*":    ["./shared/*"]
}
```

---

### `contracts/`

New files only. DTOs with `class-validator` decorators + response classes with `fromPayload`.

```
contracts/
  user/
    create-user.dto.ts
    update-user.dto.ts
    user.response.ts          ← UserResponse.fromPayload(raw)
  company/
    create-company.dto.ts
    company.response.ts
  license/
    upsert-license.dto.ts
    license.response.ts
  project/
    create-project.dto.ts
    project.response.ts
  deliverable/
    deliverable.response.ts
```

---

### `adminDashboard/`

```
adminDashboard/
  adminDashboard.module.ts
  users/
    users.controller.ts         ← AdminGuard endpoints only
    users.abstract-repo.ts
    users.repo.ts
    users.module.ts
  companies/
    companies.controller.ts
    companies.abstract-repo.ts
    companies.repo.ts
    companies.module.ts
  projects/
    projects.controller.ts
    projects.uc.ts
    projects.abstract-repo.ts
    projects.repo.ts
    projects.module.ts
  licenses/
    licenses.controller.ts
    licenses.uc.ts
    licenses.abstract-repo.ts
    licenses.repo.ts
    licenses.module.ts
  deliverables/
    deliverables.controller.ts
    deliverables.uc.ts
    deliverables.abstract-repo.ts
    deliverables.repo.ts
    deliverables.module.ts
  linkUser/                     ← was liens/lienUserCompany/
    linkUser.controller.ts
    linkUser.uc.ts
    linkUser.abstract-repo.ts
    linkUser.repo.ts
    linkUser.module.ts
```

---

### `userDashboard/`

```
userDashboard/
  userDashboard.module.ts
  readProfile/
    readProfile.controller.ts   ← GET /users/slug/:slug
    readProfile.abstract-repo.ts
    readProfile.repo.ts
    readProfile.module.ts
  readLicense/
    readLicense.controller.ts   ← GET /licenses/user/:userId + POST /activate
    readLicense.uc.ts
    readLicense.abstract-repo.ts
    readLicense.repo.ts
    readLicense.module.ts
```

---

### `payment/`

```
payment/
  payment.module.ts
  stripe.controller.ts
  stripe.uc.ts              ← orchestration: billing portal + LinkUserUc call
```

---

### `system/`

```
system/
  version.controller.ts
  system.module.ts
```

---

### Refactoring phases

| Phase | Content | Risk |
|---|---|---|
| 0 — shared | Move entities, guards, helpers, storage | Low — pure moves, migrations untouched |
| 1 — contracts | New DTOs + response classes | None — new files only |
| 2 — adminDashboard | Move + reorganize all admin modules | Medium — verify each sub-module compiles |
| 3 — userDashboard | Extract user endpoints from admin controllers | High — controller split |
| 4 — payment | Extract business logic from Stripe controller | Medium |
| 5 — cleanup | Delete liens/, common/, update app.module.ts | Low |

Verify `npm run build` passes after each phase before moving to the next.
