# ilipro — Project Guide

Admin SaaS for managing companies, projects, clients, and licenses.

## Stack

- **Front** : React + TypeScript + Vite + Tailwind + React Query + React Router
- **Back** : NestJS + TypeScript + TypeORM + PostgreSQL

Monorepo à trois packages : `front/`, `back/`, `contracts/` (partagé). `zod` est installé à la racine pour que `contracts/` résolve depuis les deux côtés.

---

## Commands

```bash
# Front (cd front)
npm run dev            # serveur de dev Vite
npm run build          # tsc -b && vite build
npm run lint           # ESLint

# Back (cd back)
npm run start:dev      # NestJS en watch
npm run build          # nest build
npm run lint           # ESLint --fix (obligatoire avant de finir une tâche)
npm run format         # Prettier

# Migrations TypeORM (cd back) — data-source : src/infra/database/data-source.ts
npm run migration:generate -- src/infra/database/migrations/<Name>
npm run migration:run
npm run migration:revert

# Stack locale (Postgres…) — cd ops
make up        # docker-compose up -d
make down      # docker-compose down
```

> **Toute modification d'une `*.entity.ts` (champ ajouté/retiré/renommé) impose une migration** : `migration:generate` puis `migration:run`. Ne jamais laisser le schéma BDD désynchronisé de l'entité.

### Tests

**Pas de tests pour l'instant — phase de build, on évite l'overhead.** Jest est câblé côté back mais aucun `*.spec.ts` n'existe : ne pas en créer ni en inventer un framework tant que cette ligne n'a pas changé. Si une tâche demande explicitement un test, le signaler avant d'en écrire.

### Variables d'environnement

Toute la config runtime (PostgreSQL, JWT, Stripe, Resend, R2/S3) vit dans `back/.env` (chargé via `@nestjs/config` + `dotenv`). Ne jamais hardcoder un secret ni une URL d'infra : lire la variable depuis la config. Le front lit ses variables via `import.meta.env` (préfixe `VITE_`).

### Alias d'import `contracts/*`

Le préfixe `contracts/…` est un alias `tsconfig` configuré **des deux côtés** :

```jsonc
// back/tsconfig.json ET front/tsconfig.app.json
"paths": { "contracts/*": ["../contracts/*"] }
```

Tout import de contrat passe par cet alias (`import { Company } from 'contracts/shared/company'`) — jamais de chemin relatif `../../../contracts`. Le front inclut aussi `../contracts` dans son `include`.

---

## Colocation — principe transverse

Vaut pour **tout artefact ni-HTTP ni-persistence** : hook, mutation, mapper, `.uc.ts`, model. Les sections Frontend/Backend ne le répètent pas — elles ajoutent seulement leur nuance.

> **Un artefact vit au plus près de son unique consommateur. Il remonte d'un cran — et d'un seul — quand un 2ᵉ consommateur non lié apparaît.**

| Portée                            | Emplacement                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| Un seul consommateur              | Colocalisé dans son dossier (composant / page / controller)                                |
| ≥2 consommateurs non liés (front) | `components/` si business · `hooks/` si générique UI                                        |
| ≥2 controllers (back)             | `infra/mappers/`, `core/flows/`, `core/repos/`                                              |
| Exception assumée                 | Remontée d'office, **annotée dans le code** (entité fondamentale, réutilisation anticipée) |

---

## Frontend Architecture

### Folder structure

```
src/
  main.tsx          ← entry point + déclaration des routes (BrowserRouter + <Routes>)
  App.tsx           ← shell applicatif
  api/              ← data layer: React Query QUERIES (read) + parsing, split by domain
  lib/              ← pure utilities, constants, config — no hooks, no business types
  hooks/            ← generic UI hooks only (react-only deps)
  components/       ← business components shared across pages
  pages/            ← page-scoped code, colocated with its hooks
  contexts/         ← AuthContext (useAuth) : user courant + isAdmin, source des gardes de route
```

**Routing** : les routes sont déclarées dans `main.tsx` (un `<Route>` par page). Ajouter une page = créer le composant page **et** enregistrer sa route dans `main.tsx`. Une route protégée s'enveloppe dans `<ProtectedRoute>` (connecté) ou `<AdminRoute>` (admin) de [`components/ProtectedRoute.tsx`](front/src/components/ProtectedRoute.tsx) ; ces gardes lisent `useAuth()` depuis `contexts/AuthContext`.

### `api/` — data layer

One file per business domain. Le fichier contient les **queries React Query** (lecture) + le parsing (`fromJson`). **Les mutations n'y vivent pas** (cf. règle ci-dessous).

```
api/
  companies.ts      ← useCompanies(), useCompany()      — queries only
  users.ts          ← useUsers(), useUser()             — queries only
  licenses.ts       ← useUserLicense()                  — queries only
  projects.ts       ← useProjects()                     — queries only
```

#### Query vs mutation — où vit chaque hook React Query

| Hook React Query                         | Vit où                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| **Query** (lecture, cache partagé, keyé) | `api/<domain>.ts`                                                            |
| **Mutation** (écriture)                  | **colocalisée** avec le composant/hook déclencheur (principe de colocation) |

Une mutation est attachée à une action d'UI précise et porte souvent de l'état UI local (`modalOpen`, recherche, sélection…) — c'est pourquoi elle ne vit pas dans `api/`. Elle parse sa réponse via le contrat (`fromJson`) et invalide les query keys de `api/` qu'elle a rendues périmées. Exemple réel : `front/src/pages/admin/companyDetail/users/useLinkUser.ts` colocalise sa `useMutation` avec l'état de la modale de liaison.

#### Query keys & invalidation

- **Du général au spécifique** : `[domain]` = collection ; `[domain, id]` = une entité ; `[domain, id, sub]` = sous-collection. Segment le plus précis en dernier (`['companies']`, `['companies', slug, 'users']`, `['users', userId, 'license']`).
- **Un identifiant canonique par domaine** — ne pas mélanger `id` et `slug` pour la même entité dans la clé.
- **Invalidation = la clé la plus large contenant la donnée modifiée.** React Query invalide par **préfixe** : invalider `['companies', slug]` invalide d'un coup users + projects de cette company. Créer/supprimer → `[domain]` ; muter une relation → la sous-collection.
- `retry: false` est le défaut maison.

**Les types métier vivent dans `contracts/`, pas dans `api/`.** Le fichier `api/<domain>.ts` **importe** le type contrat pour parser (`Company.fromJsonList(...)`) mais ne le **re-exporte pas**. Un composant importe :

- le **hook** depuis `api/<domain>` ;
- le **type** directement depuis `contracts/` (`import { Company } from 'contracts/shared/company'`).

`api/<domain>.ts` n'exporte que ce qu'il **définit lui-même** : ses hooks, et éventuellement un type _dérivé/composite_ qui n'existe pas dans `contracts/`. Pas de re-export de forwarding — il masque la source de vérité et ajoute une indirection à la lecture (`from '../api/companies'` laisse croire que le type est défini là).

**Pas de barrel.** Interdiction d'un fichier qui re-exporte en vrac hooks + types de plusieurs domaines (ex. un `lib/queries.ts`). Chaque consommateur importe depuis la vraie source : le hook depuis son `api/<domain>`, le type depuis `contracts/`.

Never put business types or React Query hooks in `lib/`.

### `lib/` — pure utilities

No hooks. No business types. Only:

- `api.ts` — client **axios** (`baseURL: VITE_API_URL`, `withCredentials: true`) ; auth par cookie
- `licenseConstants.ts` — static maps and labels
- `toast.ts` — toast helpers
- `utils.ts` — generic functions

### `hooks/` — generic UI hooks only

`hooks/` ne contient que des hooks **génériques UI** : ceux qui n'importent **que** `react`. Exemples : `useCarousel`, `useClipboard`, `usePageTitle`.

**Test de dépendance (binaire)** : dès qu'un hook importe `api/`, `lib/api`, `lib/toast`, `contracts/`, ou un type métier → c'est un **business hook**, il n'a rien à faire ici, il se colocalise (principe de colocation). Mémo : _« pourrais-je publier ce hook sur npm et le réutiliser dans une app sans rapport avec ilipro ? »_ Oui → `hooks/` ; non → colocalisé.

Deux axes décident l'emplacement d'un hook :

- **Nature** (test ci-dessus) : générique UI → éligible à `hooks/` ; business → **jamais** dans `hooks/`.
- **Portée** : 1 consommateur → chez lui ; ≥2 non liés → il remonte. Un business hook partagé par 2 pages remonte dans `components/`, **pas** dans `hooks/`.

### `components/` — shared business components

**Règle d'import** : une page ne peut pas importer depuis une autre page. Si tu as besoin d'un composant d'une page dans une autre, tu dois le remonter dans `components/` — mais seulement si c'est une vraie duplication sans raison de diverger. Si les deux usages ont des raisons de bifurquer indépendamment, duplique plutôt que de partager.

Components used by more than one page. Split into:

```
components/
  ui/               ← zero business knowledge (Button, Input, Modal, Badge, Spinner…)
  LicenseBadge.tsx
  VersionBadge.tsx
  UserHeader.tsx    ← partagé par admin/userDetail + user (≥2 pages → remonté ici)
  layouts/
    AdminLayout.tsx
    UserLayout.tsx
  companySection/   ← partagé par admin/userDetail + user (entry + license/ + project/)
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
    users/
  user/
    UserDetailPage.tsx        ← espace utilisateur connecté (lecture), distinct de admin/userDetail
  login/
    useLogin.ts
    otpStep/
```

---

## File size and splitting

**Split when you can name the fragment, not when a line count is hit.**

A well-designed component can be 150 lines and need no split. A poorly structured one can be 80 lines and need one immediately. The trigger is semantic: if a section of a file has a clear, nameable responsibility that is distinct from the rest, extract it. If you can't name it precisely, don't split it.

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

**Extract a hook when you can give it a precise name** (`useRenameCompany`, `useLicenseForm`). If you can't name it without saying "logic" or "stuff", keep the code inline. A hook that wraps a single `useState` or a single query call is not a hook — it's noise.

Emplacement : voir « Colocation — principe transverse ». Spécialisation front :

| Scope                                     | Where it lives                      |
| ----------------------------------------- | ----------------------------------- |
| Used only by one component                | Colocated in the component's folder |
| Used only by one page                     | Colocated in the page's folder      |
| Used by a shared component (e.g. sidebar) | Inside that component's folder      |
| Truly generic UI                          | `hooks/`                            |
| Data fetching                             | `api/<domain>.ts`                   |

---

## Duplication vs decoupling

Intentional duplication is preferred over forced DRY when two components serve different intents.

Exemple réel : [`components/sidebar/Sidebar.tsx`](front/src/components/sidebar/Sidebar.tsx) (admin : arbre companies + liste users + recherche transverse) et [`components/sidebar/userSidebar/UserSidebar.tsx`](front/src/components/sidebar/userSidebar/UserSidebar.tsx) (user : scopé à ses propres companies). Même coquille visuelle (logout, `VersionBadge`, nav), mais intentions opposées — pilotage global vs consommation de son propre périmètre. Deux implémentations indépendantes, **aucun cross-import** : elles évoluent séparément, on ne les fusionne pas.

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
  infra/                      ← tout ce qui est NestJS/infrastructure, zéro logique métier
    guards/                   ← JwtAuthGuard, AdminGuard
    interceptors/             ← LoggingInterceptor
    decorators/               ← public.decorator.ts (route publique, hors AdminGuard)
    database/                 ← data-source.ts, DatabaseModule, migrations/
    repos/                    ← implémentations concrètes (@Injectable + @InjectRepository)
      user/                   ← user.repo.ts (une seule classe, implémente reader + writer)
      company/ project/ license/ userCompany/ deliverable/ otp/
      storage/                ← r2.repo.ts
      repo.module.ts          ← @Module wiring : lie abstractions (core/) aux implémentations
    controllers/              ← couche HTTP pure : reçoit requête → appelle flow → retourne réponse
      login/                  ← LoginController, LoginModule
      adminDashboard/         ← CRUD complet, AdminGuard
        users/ companies/ projects/ licenses/ deliverables/
                              ← un dossier de ressource peut héberger plusieurs controllers
                                (projects/ → ProjectsController + CompanyProjectsController ;
                                 deliverables/ → DeliverablesController + ProjectDeliverablesController)
        linkUser/             ← shell : controller seulement, logique dans core/flows/linkUser/
      userDashboard/          ← lecture seule, contexte utilisateur connecté
        readProfile/ readLicense/
      payment/                ← StripeController + BillingPortalController (logique dans core/flows/payment/)
      system/                 ← GET /version
    mappers/                  ← mappers partagés : conversion entité TypeORM → classe contrat
                                 (company.mapper.ts, user.mapper.ts, …)
                                 Un mapper colocalisé vit dans le dossier de son controller.

  core/                       ← domaine pur
    utils/                    ← fonctions TS pures sans dépendance NestJS (slug.ts, …)
    models/                   ← structures de domaine sans table (agrégats, projections, value objects)
                                 — apparaît au premier besoin, pas en prévision
    repos/                    ← entités + abstractions uniquement (zéro @InjectRepository)
      user/                   ← user.entity.ts, user.reader.abstract-repo.ts, user.writer.abstract-repo.ts
      company/ project/ license/ userCompany/ deliverable/ otp/
      readProfile/ readLicense/ payment/   ← read repos (voir « 3ᵉ pattern » ci-dessous)
      storage/                ← storage.abstract-repo.ts (IStorageRepo)
    flows/                    ← orchestrations cross-features (@Injectable accepté)
      linkUser/               ← LinkUserUc + module
      projects/               ← ProjectsUc
      deliverables/           ← DeliverablesUc
      payment/                ← StripeUc
      jwt/                    ← JwtUc, OtpUc, jwt-payload
```

### Règles de couche

| Couche        | Règle                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `core/utils/` | Zéro NestJS — TS pur uniquement. Fonctions génériques réutilisables (slug, temps, …).                                            |
| `infra/`      | Couplage infrastructure : `@InjectRepository`, `@Controller`, `@UseGuards`, `@Module`. Zéro logique métier.                      |
| `core/`       | Domaine. Accepté : `@Entity/@Column/@Unique` + `@Injectable()`. Interdit : `@InjectRepository`, `@Controller`, décorateurs HTTP. |

### Flux de dépendance

```
infra/controllers/ → core/flows/ → core/repos/ (abstractions) ← infra/repos/ (implémentations)
```

### Auth & guards

`JwtAuthGuard` est câblé **global** via `APP_GUARD` ([`app.module.ts`](back/src/infra/guards/jwt-auth.guard.ts)) : par défaut **toute route exige un JWT valide**. À partir de là, trois cas :

| Type de route                                   | Guard                                                          | Comment                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Admin** (`adminDashboard/`)                   | `@UseGuards(AdminGuard)` sur le controller                     | exige `isAdmin` en plus du JWT global                                    |
| **Connecté** (`userDashboard/`, profil/licence) | rien à ajouter                                                 | le `JwtAuthGuard` global suffit                                          |
| **Public** (`login/`)                           | `@Public()` ([`public.decorator.ts`](back/src/infra/decorators/public.decorator.ts)) | exempte la route du `JwtAuthGuard` global                                |

Règle pratique : un nouvel endpoint admin → `@UseGuards(AdminGuard)` ; un endpoint pour l'utilisateur connecté → ne rien ajouter ; un endpoint d'auth/pré-login → `@Public()`.

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

> **Cérémonie assumée.** Oui, c'est 4 fichiers par table (entity + reader + writer + repo) pour une seule classe concrète derrière deux tokens. C'est un choix **délibéré** : le payoff est le narrowing typé au point d'injection (un flow de lecture ne peut pas appeler `delete`). **Ne pas collapser** reader+writer en une abstraction unique, et **ne pas dupliquer** la logique entre les deux — on suit le pattern même quand il paraît verbeux. Un repo qui n'est pas un CRUD 1:1 relève du **read repo** (ci-dessous), pas du couple.

#### 3ᵉ pattern — le `read repo` (lecture transverse, pas de couple reader/writer)

Le couple reader/writer vaut pour un repo **CRUD 1:1 avec une table**. Quand un repo lit **plusieurs tables** (jointure / vue dénormalisée) ou **aucune table** (API externe), il n'y a rien à écrire en CRUD : on n'invente pas un writer vide. C'est un **read repo** : une **abstraction unique** qui renvoie un read model (voir aussi `core/models/`), pas un couple.

| Cas                                | Pattern                                                       | Exemple réel                                                                |
| ---------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| CRUD 1:1 sur une table             | couple `IXxxReaderRepo` / `IXxxWriterRepo`                    | `IUserReaderRepo` / `IUserWriterRepo`                                       |
| Lecture multi-tables (vue agrégée) | read repo unique `IReadXxxRepo`                              | `IReadProfileRepo` (User+Company+Project+License), `IReadLicenseRepo`       |
| Aucune table (API externe)         | read repo unique `IXxxReadRepo`                              | `IPaymentReadRepo` (Stripe)                                                 |

- **Nommage** : les deux formes coexistent — `IReadXxxRepo` (lecture orientée vue, `IReadProfileRepo`) et `IXxxReadRepo` (lecture orientée ressource externe, `IPaymentReadRepo`). Suffixe `Repo`, jamais `Repository`. Classe concrète en `XxxRepo` comme partout (`ReadProfileRepo`, `StripeRepo`).
- **Annoté dans le code** : chaque read repo porte un commentaire d'en-tête expliquant pourquoi il déroge au couple reader/writer (cf. `readProfile.abstract-repo.ts`).
- **Où vit le read model** : tant que `core/models/` n'existe pas, la forme du read model est déclarée en `interface` **dans le fichier de l'abstract-repo** (cf. `MemberProfile` / `CompanyProfile` dans [`readProfile.abstract-repo.ts`](back/src/core/repos/readProfile/readProfile.abstract-repo.ts)). Elle migrera vers une classe `core/models/*.model.ts` le jour où elle porte de la **logique** de domaine (aujourd'hui c'est une projection passive).
- **Garde-fou** : un read repo ne porte **pas** de méthode d'écriture CRUD. S'il a besoin d'écrire (ex. `IReadLicenseRepo.activate` qui pose un machineLock), c'est une **action métier ciblée**, pas un `update()` générique — sinon la donnée relève du couple reader/writer standard.

### Where logic lives

| File                       | Role                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.entity.ts`               | Entité TypeORM (`@Entity/@Column`) — correspond 1:1 à une ligne BDD. Peut porter de la logique objet **qui dépend de ses propres champs** (`isExpired()`, `canActivate()`).                                                                                                                                                   |
| `core/models/*.model.ts`   | Structure de domaine **sans table propre** : agrégat reconstruit depuis plusieurs sources, projection calculée, value object (`DateRange`, `LicenseQuota`). Porte la logique métier qui n'appartient à aucune ligne BDD. Zéro décorateur de persistance.                                                                      |
| `.reader.abstract-repo.ts` | Contrat lecture seule — injection token NestJS                                                                                                                                                                                                                                                                                |
| `.writer.abstract-repo.ts` | Contrat écriture — injection token NestJS                                                                                                                                                                                                                                                                                     |
| `.repo.ts`                 | **Une seule** classe concrète par entité — implémente les deux abstractions, dans `infra/repos/`.                                                                                                                                                                                                                             |
| `.uc.ts`                   | **Orchestre** plusieurs repos ; délègue les décisions métier aux entités/models (jamais de règle métier dans son corps). **Crée un `.uc.ts` quand tu peux lui donner un nom métier précis** (ex. `LinkUserUc`, `RenewLicenseUc`). Si tu ne peux pas le nommer, la logique appartient au controller, à l'entité ou à un model. |
| `core/utils/`              | Fonctions pures sans dépendance NestJS — slug, gestion du temps, etc.                                                                                                                                                                                                                                                         |

#### Les trois adresses de la logique métier

Quand une logique n'est ni du HTTP (controller) ni de l'accès données (repo), elle a exactement trois maisons possibles :

| Logique                                                                   | Vit où                                                         |
| ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Comportement sur **une** entité, dépend de ses champs                     | méthode sur l'`.entity.ts`                                     |
| Structure **pas en BDD** + sa logique (agrégat, projection, value object) | `core/models/`                                                 |
| Combine **plusieurs** repos + applique des règles                         | `.uc.ts` **orchestre**, délègue la décision aux models/entités |

> **Test de fuite** : si un `.uc.ts` contient un `if` qui _calcule_ du métier au lieu d'appeler une méthode de model/entité, la logique a fui dans l'orchestrateur. Le UC a le droit de brancher sur le **résultat** (`if (!quota.canAddSeat()) throw`), pas de le calculer.

#### Convention de nommage : `Entity` vs `Model`

- **`XxxEntity`** (`user.entity.ts` → `UserEntity`) — classe TypeORM, une ligne BDD. Le nom de classe matche le fichier.
- **`XxxModel`** (`core/models/license-quota.model.ts` → `LicenseQuotaModel`) — structure de domaine sans table.

Deux mots, deux sens nets : `Entity` = persistance, `Model` = domaine. Ne jamais nommer une entité TypeORM `*Model`.

#### Type de retour des repos : `Entity` par défaut, `Model` en exception

- **Par défaut** : le repo renvoie une `Entity` (cas CRUD, correspondance 1:1 avec une ligne). Le mapping entité→contrat se fait dans le controller via le mapper.
- **Exception assumée** : le repo renvoie un `Model` quand ce qu'il lit est un **agrégat ou une projection sans table propre**. C'est le repo qui assemble le `Model`.
- Le **type de retour de l'abstract-repo est la source de vérité** : `findById(): Promise<UserEntity>` = lecture brute ; `getLicenseQuota(): Promise<LicenseQuotaModel>` = projection de domaine.
- **Garde-fou** : un repo ne mélange pas les deux pour la **même** donnée. Pas de `findById → Entity` _et_ `findByIdAsModel → Model` sur la même chose. Si une donnée mérite un `Model`, le `Model` devient son unique type de lecture.

> `core/models/` n'apparaît qu'au moment où une première classe le justifie — pas en prévision. Comme les hooks et les `.uc.ts`.

**Injection pattern:**

```ts
// abstract-repo: abstract class, not interface (survives compilation)
export abstract class IUserReaderRepo {
  abstract findById(id: string): Promise<UserEntity>;
}

// repo.module.ts: une seule classe concrète derrière les deux tokens
{ provide: IUserReaderRepo, useExisting: UserRepo }
```

**Shared endpoints — duplicate, don't share:**
Endpoints communs à admin et user sont dupliqués délibérément. Incidental similarity ≠ conceptual identity.

### Colocation (back)

Même principe transverse (voir « Colocation — principe transverse »). Nuance back : par défaut **au plus près du controller** ; monte dans `core/` si utilisé par plusieurs controllers. Exception assumée (repo d'entité fondamentale, réutilisation anticipée) → remontée d'office, **annotée dans le code**.

---

## Contracts

Le dossier `contracts/` est à la racine du projet, au même niveau que `front/` et `back/`. C'est la **source de vérité partagée** entre les deux.

### Structure

```
contracts/
  adminDashboard/
    companies/                  ← CompaniesController
      getCompany/
        getCompany.request.ts     ← BASE + buildUrl + params/query classes
        getCompany.response.ts    ← classe response + static fromJson()
      createCompany/
        createCompany.request.ts  ← BASE + buildUrl
        createCompany.body.ts     ← classe body avec décorateurs @Is*
        createCompany.response.ts
    companyProjects/            ← CompanyProjectsController
    projects/                   ← ProjectsController
    deliverables/              ← DeliverablesController
    projectDeliverables/       ← ProjectDeliverablesController
    licenses/                   ← LicensesController
    linkUser/                   ← LinkUserController
    users/                      ← UsersController
  userDashboard/
    readProfile/
    readLicense/
    activateLicense/
  payment/
  login/
  system/
```

**Un dossier `contracts/` par controller** — au sens d'un fichier `*.controller.ts` de `back/src/infra/controllers/`, **pas** au sens d'un dossier de ressource. La granularité diffère volontairement des deux côtés : côté back un dossier de ressource peut héberger **plusieurs** controllers (`controllers/adminDashboard/projects/` = `ProjectsController` + `CompanyProjectsController`), mais côté contracts chacun a **son** dossier (`projects/` **et** `companyProjects/`). Sous-dossier par route, nommé en camelCase par action (`getCompany`, `createCompany`, `deleteCompany`…).

### Fichiers par route

| Fichier         | Contenu                                             | Utilisé par                                                                                 |
| --------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `*.request.ts`  | `static BASE_URL` (string), `static buildUrl(…)`    | `BASE_URL` → back (décorateurs `@Get/@Post/…`) ; `buildUrl` → front (construction de l'URL) |
| `*.body.ts`     | Classe body avec décorateurs `@Is*`                 | Back (ValidationPipe) — séparé si le body est complexe                                      |
| `*.response.ts` | Classe response + `static fromJson(json): Response` | Front (parse) + back (type retour)                                                          |

Si le body est simple, il peut rester dans `*.request.ts`. Séparer dans `*.body.ts` dès que ça dépasse ~20 lignes.

### Conventions

```ts
// getCompany.request.ts — avec params URL
export class GetCompanyRequest {
  static BASE_URL = "/companies/:slug";
  static buildUrl(slug: string) {
    return `/companies/${slug}`;
  }
}

// listCompanies.request.ts — sans params URL
export class ListCompaniesRequest {
  static BASE_URL = "/companies";
  static buildUrl() {
    return ListCompaniesRequest.BASE_URL;
  }
}
```

**Règles** :

- `BASE_URL` est réservé au back (décorateurs NestJS). Le front n'y touche jamais.
- Le front appelle **toujours** `XxxRequest.buildUrl(…)` — zéro URL hardcodée dans les hooks et composants.
- Avec params : `buildUrl` interpole les valeurs dans le template.
- Sans params : `buildUrl` retourne `ClassName.BASE_URL` — pas de duplication de la chaîne.

```ts
// getCompany.response.ts — re-export si la response est exactement le type shared
export { Company } from "../../../shared/company";
```

```ts
// back — controller
import { GetCompanyRequest } from 'contracts/adminDashboard/companies/getCompany/getCompany.request'
import { Company } from 'contracts/shared/company'

@Get(GetCompanyRequest.BASE_URL)
async getCompany(@Param('slug') slug: string): Promise<Company> { … }
```

```ts
// front — api hook
import { GetCompanyRequest } from "contracts/adminDashboard/companies/getCompany/getCompany.request";
import { Company } from "contracts/shared/company";

const data = Company.fromJson(await api.get(GetCompanyRequest.buildUrl(slug)));
```

### Types shared — classes avec schema zod

Les types dans `contracts/shared/` sont des **classes** avec un schema zod statique. Le schema est la source de vérité : il valide à l'exécution et les `declare` exposent les propriétés à TypeScript sans émettre de JS.

```ts
// contracts/shared/company.ts
import { z } from "zod";

export class Company {
  static readonly schema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    createdAt: z.string(),
  });

  declare id: string;
  declare name: string;
  declare slug: string;
  declare createdAt: string;

  static fromJson(json: unknown): Company {
    return Object.assign(new Company(), Company.schema.parse(json));
  }

  static fromJsonList(json: unknown): Company[] {
    return z
      .array(Company.schema)
      .parse(json)
      .map((d) => Object.assign(new Company(), d));
  }
}
```

- `fromJson` lève une erreur explicite si un champ manque ou est mal typé — zéro cast aveugle.
- `declare` est du sucre TypeScript pur, compatible `erasableSyntaxOnly`.
- zod est installé à la racine du monorepo (`/package.json`) pour que la résolution module fonctionne depuis `contracts/` que ce soit le front ou le back qui compile.
- `fromJson` pour un objet unique, `fromJsonList` pour les tableaux.
- **Un sous-type objet imbriqué est lui aussi une classe** avec son `static schema` + `declare` + `fromJson`. La classe parente référence le schema enfant (`machines: z.array(LicenseMachine.schema)`) — cf. `License` / `LicenseMachine` / `LicenseProject` dans [`contracts/shared/license.ts`](contracts/shared/license.ts). Seuls les **enums** (unions de chaînes, ex. `LicenseTypeSchema`) restent des `z.enum` exportés, pas des classes.
- Les types composites (non présents dans `shared/`) définissent leur propre classe avec `fromJson`/`fromJsonList` dans leur `*.response.ts`.
- Les `*.response.ts` qui retournent un type shared sont de simples re-exports : `export { Company } from '../../../shared/company'`.

### Mapper pattern — conversion entité → contrat

Les entités TypeORM ont des champs `Date` ; les classes de contrat ont des `string`. La conversion se fait dans `back/src/infra/mappers/` via des mappers statiques. **Zéro `as unknown as` dans les controllers.**

```
infra/mappers/
  company.mapper.ts     ← CompanyMapper.toResponse(entity): Company
  user.mapper.ts        ← UserMapper.toResponse(entity): User  +  toCompanyUser(user, license): CompanyUser
  project.mapper.ts     ← ProjectMapper.toResponse / toResponseList
  license.mapper.ts     ← LicenseMapper.toResponse (mappe aussi les nested machines/projectAccess)
  deliverable.mapper.ts ← DeliverableMapper.toResponse / toResponseList
  readProfile.mapper.ts ← ReadProfileMapper.toResponse (profil utilisateur imbriqué)
```

Pattern controller :

```ts
@Get(LIST_BASE)
async findAll(): Promise<Company[]> {
  return CompanyMapper.toResponseList(await this.readerRepo.findAll());
}

@Get(GET_BASE)
async findBySlug(@Param('slug') slug: string): Promise<Company> {
  return CompanyMapper.toResponse(await this.readerRepo.findBySlug(slug));
}
```

- `Object.assign(new ResponseClass(), { ...fields })` — crée une vraie instance du contrat
- Les mappers sont dans `infra/` (pas `core/`) car ils connaissent les entités TypeORM et les classes contrat
- Un mapper par entité métier ; les méthodes sont spécialisées si la réponse est composite (ex. `toCompanyUser`)

### Colocation des mappers

Même principe transverse (voir « Colocation — principe transverse »). Nuance : un mapper utilisé par **plusieurs controllers** vit dans `infra/mappers/` (cas des CRUD `CompanyMapper`, `UserMapper`… que plusieurs controllers manipulent) ; un mapper de **vue complexe spécifique à un endpoint** (ex. `readProfile.mapper.ts`) reste colocalisé avec son controller.

### Types de retour explicites dans les controllers

Chaque méthode de controller **doit** avoir un type de retour explicite ancré dans le contrat :

```ts
@Get(LIST_BASE)
async findAll(): Promise<Company[]> { … }

@Post(CREATE_BASE)
async create(@Body() dto: CreateCompanyDto): Promise<Company> { … }
```

### Règles

- **Zéro logique métier** dans les contrats — types, interfaces, `fromJson()` uniquement.
- **`fromJson()` uniquement sur les responses** — le front ne valide pas les inputs avec class-validator.
- **Pas de décorateurs dans `contracts/`** — le front a `erasableSyntaxOnly: true` et n'active pas `experimentalDecorators`, la compilation planterait. Les décorateurs `@Is*` restent dans le back.
- **Back** : chaque controller définit des DTOs locaux (dans le fichier controller ou un fichier sibling) qui `implement` l'interface du contrat et y ajoutent les décorateurs `@Is*`. TypeScript garantit que le DTO reste aligné sur le contrat — si le type shared change, le DTO ne compile plus jusqu'à être mis à jour.
- Le back active `ValidationPipe` globalement — aucun pipe manuel par route nécessaire.
- Chaque nouveau controller **doit** avoir son dossier dans `contracts/` avant d'écrire le controller.
- Les imports de types dans `contracts/` utilisent `import type` (requis par `verbatimModuleSyntax` du front).

### Pattern DTO back

```ts
// dans le controller ou un fichier sibling *.dto.ts
import type { CreateCompanyBody } from "contracts/adminDashboard/companies/createCompany/createCompany.body";
import { IsString, MinLength } from "class-validator";

class CreateCompanyDto implements CreateCompanyBody {
  @IsString()
  @MinLength(2)
  name: string;
}
```

---

## Gestion des erreurs

Convention en place — la suivre, ne pas réinventer de `try/catch` d'affichage.

**Back** — lever les exceptions Nest standard, le filtre HTTP s'occupe du status :

- `NotFoundException` (404) — ressource introuvable
- `BadRequestException` (400) — input invalide (le `ValidationPipe` global lève déjà les 400 de validation des DTO)
- `UnauthorizedException` (401) / `ForbiddenException` (403) — auth / droits
- `ConflictException` (409) — conflit d'état métier (quota atteint, doublon…)

**Front** — jamais de gestion d'affichage manuelle : brancher `onError: toastError` sur les mutations.

- `toastError(err)` (`lib/toast.ts`) lit `err.response.data.message` (gère le tableau renvoyé par class-validator) et retombe sur `'Une erreur est survenue'`.
- Succès : `toastSuccess(message)`.
- Les queries laissent React Query gérer le retry (défaut maison : `retry: false`).

---

## Vertical slice — exemple end-to-end

Le tutoriel détaillé qui déroule une feature réelle (`linkUser`) de bout en bout — contrat → repo → use case → controller → mapper → wiring → front — vit dans [`docs/architecture.md`](docs/architecture.md). À lire quand on ajoute un endpoint et qu'on veut le chemin complet.

**Récap de l'ordre :**

```
contrat → (model si règle hors-table) → abstractions repo → impl repo
        → use case (orchestre) → controller + DTO + mapper → wiring
        → (migration si une entité a changé)
        → query dans api/<domain> + mutation colocalisée + route dans main.tsx (page nouvelle)
```

Si ta feature est un CRUD sans règle métier, saute le model et le `.uc.ts` : controller → repo direct → mapper. Le `.uc.ts` et le `model/` n'apparaissent que quand tu peux les nommer.

---

## Garde-fous outillés (enforced)

Plusieurs règles de ce doc ne sont **pas** que des conventions : ESLint les casse. Quand tu touches du code, c'est le lint qui te corrige, pas ta mémoire. **Ne contourne pas** ces règles (pas de `// eslint-disable` pour passer outre une frontière).

| Règle                                                | Outil                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| Une page n'importe pas d'un autre groupe de pages    | `import/no-restricted-paths` ([front](front/eslint.config.js)) |
| `lib/` sans data layer · `hooks/` & `ui/` sans métier | `import/no-restricted-paths` (front)                          |
| Contrats via l'alias `contracts/…`, jamais en relatif | `no-restricted-imports` (front)                              |
| `core/` ne dépend jamais de `infra/`                 | `import/no-restricted-paths` ([back](back/eslint.config.mjs))  |
| `as unknown as` interdit dans un controller          | `no-restricted-syntax` (back)                                 |
| Imports de types en `import type`                    | `@typescript-eslint/consistent-type-imports` (front + back)   |
| Pas de décorateurs dans `contracts/`                 | `erasableSyntaxOnly` du tsconfig front                        |

## Pièges spécifiques à ilipro

Les fautes que cette codebase induit le plus souvent. ❌ = à ne pas faire, → correction.

- ❌ `useMutation` dans `api/<domain>` → mutation **colocalisée** près de son déclencheur ; `api/` ne contient que des queries.
- ❌ re-exporter un type contrat depuis `api/<domain>` → le composant importe le type **directement** depuis `contracts/`.
- ❌ hook qui importe `api`/`contracts` rangé dans `hooks/` → c'est un **business hook**, il se colocalise.
- ❌ page qui importe d'une autre page → **duplique**, ou remonte le partagé dans `components/` (enforced).
- ❌ `findByIdAsModel` à côté de `findById` sur la même donnée → une donnée a **un seul** type de lecture (Entity *ou* Model).
- ❌ inventer un writer vide pour un repo qui ne fait que lire (jointure / API externe) → c'est un **read repo** unique.
- ❌ un `if` qui *calcule* du métier dans un `.uc.ts` → la décision vit dans l'entité/model ; le UC ne fait que **brancher** sur le résultat.
- ❌ `as unknown as` dans un controller → conversion via un **mapper** (`infra/mappers/`).
- ❌ URL hardcodée dans un hook/controller → toujours `XxxRequest.buildUrl(…)` / `BASE_URL`.
- ❌ secret ou URL d'infra hardcodé → lire la **config** (`back/.env`, `import.meta.env` côté front).
- ❌ modifier une `*.entity.ts` sans générer/jouer la **migration**.
- ❌ créer un `*.spec.ts` → pas de tests en phase build (cf. § Tests) sans le signaler d'abord.

## Definition of Done

Avant de considérer une tâche terminée :

- [ ] `npm run lint` **vert** des deux côtés touchés (front et/ou back) — y compris les frontières d'architecture.
- [ ] Compilation OK (`tsc -b` front · `nest build` back).
- [ ] Si une `*.entity.ts` a changé : **migration générée et jouée**.
- [ ] Si nouvel endpoint : dossier `contracts/` créé **avant** le controller ; type de retour explicite ancré au contrat.
- [ ] Si nouvelle page : route enregistrée dans `main.tsx` avec le bon garde (`ProtectedRoute`/`AdminRoute`).
- [ ] Aucune frontière contournée par `eslint-disable`.

---

## Git

Ne jamais créer de commit sans que l'utilisateur l'ait explicitement demandé dans le message courant.

---

## Code style — ESLint / Prettier

Before writing or editing any file in `back/`, read [`back/eslint.config.mjs`](back/eslint.config.mjs) and [`back/.prettierrc`](back/.prettierrc) to know the exact rules in force. Every file must pass both without errors.
