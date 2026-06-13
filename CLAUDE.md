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

### Stack

- **Back** : NestJS + TypeScript + TypeORM + PostgreSQL

### Folder structure

```
back/src/
  platform/                   ← TS pur, zéro NestJS (sortira en package monorepo)
    helpers/                  ← slug.helper.ts
    contracts/                ← DTOs + response types partagés back/front

  infra/                      ← tout ce qui est NestJS/infrastructure, zéro logique métier
    guards/                   ← JwtAuthGuard, AdminGuard
    interceptors/             ← LoggingInterceptor
    database/                 ← data-source.ts, DatabaseModule, migrations/
    repos/                    ← implémentations concrètes (@Injectable + @InjectRepository)
      user/                   ← user.reader.repo.ts, user.writer.repo.ts
      company/ project/ license/ userCompany/ deliverable/ otp/
      storage/                ← r2.repo.ts
      repo.module.ts          ← @Module wiring : lie abstractions (core/) aux implémentations
    controllers/              ← couche HTTP pure : reçoit requête → appelle flow → retourne réponse
      login/                  ← LoginController, LoginModule, public.decorator.ts
      adminDashboard/         ← CRUD complet, AdminGuard
        users/ companies/ projects/ licenses/ deliverables/
        linkUser/             ← shell : controller seulement, logique dans core/flows/linkUser/
      userDashboard/          ← lecture seule, contexte utilisateur connecté
        readProfile/ readLicense/
      system/                 ← GET /version

  core/                       ← domaine pur
    repos/                    ← entités + abstractions uniquement (zéro @InjectRepository)
      user/                   ← user.entity.ts, user.reader.abstract-repo.ts, user.writer.abstract-repo.ts
      company/ project/ license/ userCompany/ deliverable/ otp/
      storage/                ← storage.abstract-repo.ts (IStorageRepo)
    flows/                    ← orchestrations cross-features (@Injectable accepté)
      linkUser/               ← LinkUserUc + module
      payment/                ← StripeUc + module (⚠️ controllers Stripe ici temporairement)
      jwt/                    ← JwtUc, OtpUc, jwt-payload
```

### Règles de couche

| Couche | Règle |
|---|---|
| `platform/` | Zéro NestJS — TS pur uniquement |
| `infra/` | Couplage infrastructure : `@InjectRepository`, `@Controller`, `@UseGuards`, `@Module`. Zéro logique métier. |
| `core/` | Domaine. Accepté : `@Entity/@Column/@Unique` + `@Injectable()`. Interdit : `@InjectRepository`, `@Controller`, décorateurs HTTP. |

### Flux de dépendance

```
infra/controllers/ → core/flows/ → core/repos/ (abstractions) ← infra/repos/ (implémentations)
```

### Pattern repo (reader/writer)

Chaque entité dans `core/repos/<entity>/` expose deux abstractions indépendantes :

```
user.reader.abstract-repo.ts  ← IUserReaderRepo : findById, findBySlug, findByEmail
user.writer.abstract-repo.ts  ← IUserWriterRepo : findAll, create, update, delete…
```

**Une seule implémentation** dans `infra/repos/<entity>/` :
```
user.repo.ts  ← UserRepo implements IUserWriterRepo, IUserReaderRepo
```

```ts
// repo.module.ts
{ provide: IUserReaderRepo, useExisting: UserRepo }
{ provide: IUserWriterRepo, useExisting: UserRepo }
```

- Reader/writer **indépendants** au niveau des abstractions (pas d'héritage entre elles)
- **Une seule classe concrète** par entité — implémente les deux interfaces directement, zéro duplication
- La ségrégation est au niveau du **contrat** : un consommateur qui injecte `IUserReaderRepo` ne voit que les méthodes de lecture
- `infra/repos/repo.module.ts` agrège tous les tokens via `useExisting` et exporte les abstractions

### Where logic lives

| File | Role |
|---|---|
| `.entity.ts` | TypeORM entity — peut avoir de la logique objet (`isExpired()`, `canActivate()`) |
| `.reader.abstract-repo.ts` | Contrat lecture seule — injection token NestJS |
| `.writer.abstract-repo.ts` | Contrat écriture — injection token NestJS |
| `.reader.repo.ts` | Implémentation lecture — dans `infra/repos/` |
| `.writer.repo.ts` | Implémentation écriture, extends reader — dans `infra/repos/` |
| `.uc.ts` | Orchestration uniquement — coordonne plusieurs repos. **Pas de .uc.ts pour un seul appel repo.** |
| `helpers/` | Fonctions pures sans dépendance NestJS — dans `platform/helpers/` |

**Injection pattern:**
```ts
// abstract-repo: abstract class, not interface (survives compilation)
export abstract class IUserReaderRepo {
  abstract findById(id: string): Promise<UserModel>;
}

// repo.module.ts: useExisting pour éviter double instanciation
{ provide: IUserReaderRepo, useExisting: UserWriterRepo }
```

**Shared endpoints — duplicate, don't share:**
Endpoints communs à admin et user sont dupliqués délibérément. Incidental similarity ≠ conceptual identity.

### Colocation rule

> **Par défaut : au plus près du controller.**
> Monte dans `core/` si utilisé par plusieurs controllers, ou exception documentée (repo d'entité fondamentale, réutilisation anticipée).
> Les exceptions doivent être annotées dans le code.

---

## Code style — ESLint / Prettier

Before writing or editing any file in `back/`, read [`back/eslint.config.mjs`](back/eslint.config.mjs) and [`back/.prettierrc`](back/.prettierrc) to know the exact rules in force. Every file must pass both without errors.
