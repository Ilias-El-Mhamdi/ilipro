# ilipro — Architecture : tutoriel end-to-end

> Ce document est le **tutoriel détaillé** référencé depuis [`CLAUDE.md`](../CLAUDE.md). Les **règles** (couches, colocation, contrats, repos, mappers…) vivent dans `CLAUDE.md` ; ici on déroule une feature réelle de bout en bout pour montrer comment elles s'assemblent. À lire quand on ajoute un endpoint et qu'on veut le chemin complet.

## Vertical slice — exemple end-to-end (réel : linkUser)

Pour voir comment les couches s'assemblent, voici **une feature réelle de la codebase** : créer-ou-lier un utilisateur à une company (`POST /companies/:companySlug/users`). C'est le chemin de référence — pour ajouter un endpoint, on touche ces fichiers, dans cet ordre. Tous les fichiers cités existent ; seule l'**étape 2 (model)** est illustrative, car `core/models/` n'existe pas encore.

### Cas : `POST /companies/:companySlug/users` → crée l'utilisateur s'il n'existe pas, puis le lie à la company

Règle d'orchestration : si l'email existe déjà on réutilise l'utilisateur, sinon on le crée ; on ne crée le lien que s'il n'existe pas. Le UC **branche sur des résultats de lecture**, il ne calcule aucune règle métier.

#### 1. Contrat d'abord (`contracts/`) — toujours en premier

```
contracts/adminDashboard/linkUser/createCompanyUser/
  createCompanyUser.request.ts   ← BASE_URL + buildUrl
  createCompanyUser.body.ts      ← forme du body (interface, sans décorateur)
  createCompanyUser.response.ts  ← re-export du type shared User
```

```ts
// createCompanyUser.request.ts
export class CreateCompanyUserRequest {
  static BASE_URL = "/companies/:companySlug/users";
  static buildUrl(companySlug: string) {
    return `/companies/${companySlug}/users`;
  }
}

// createCompanyUser.body.ts — interface pure, le front s'en sert pour typer son payload
export interface CreateCompanyUserBody {
  firstName: string;
  lastName: string;
  email: string;
}

// createCompanyUser.response.ts
export { User } from "../../../shared/user";
```

#### 2. Model de domaine — _seulement_ si une règle n'appartient à aucune ligne BDD (`core/models/`)

> ⚠️ **Étape illustrative — `core/models/` n'existe pas encore dans la codebase.** linkUser n'a aucune règle hors-table, donc pas de model. Cet encart montre _quand_ en créer un : si la feature avait un plafond de sièges, le quota (sièges utilisés vs plafond) serait une projection sans table propre — il porterait la décision, le UC ne ferait que brancher dessus.

```ts
// core/models/license-quota.model.ts (hypothétique)
export class LicenseQuotaModel {
  constructor(
    private readonly used: number,
    private readonly cap: number,
  ) {}
  canAddSeat(): boolean {
    return this.used < this.cap;
  }
}
```

#### 3. Abstractions repo (`core/repos/`)

linkUser combine trois abstractions existantes. Noter la **ségrégation reader/writer** — l'exemple le plus net de la codebase : une **lecture** (`isLinked`) garde une **écriture** (`link`).

```ts
// core/repos/user/user.writer.abstract-repo.ts
abstract findByEmail(email: string): Promise<UserEntity | null>;
abstract create(user: UserEntity): Promise<UserEntity>;

// core/repos/userCompany/user-company.reader.abstract-repo.ts
abstract isLinked(userId: string, companyId: string): Promise<boolean>;

// core/repos/userCompany/user-company.writer.abstract-repo.ts
abstract link(userId: string, companyId: string): Promise<void>;
```

Implémentations concrètes dans `infra/repos/user/user.repo.ts` et `infra/repos/userCompany/user-company.repo.ts`.

#### 4. Use case — orchestre, ne calcule pas (`core/flows/linkUser/linkUser.uc.ts`)

`LinkUserUc` mérite son nom métier précis → c'est un `.uc.ts`. Il combine trois repos et **branche sur des résultats de lecture** (test de fuite respecté : aucun `if` ne calcule de métier).

```ts
@Injectable()
export class LinkUserUc {
  constructor(
    private readonly userRepo: IUserWriterRepo,
    private readonly userCompanyWriterRepo: IUserCompanyWriterRepo,
    private readonly userCompanyReaderRepo: IUserCompanyReaderRepo,
  ) {}

  async createOrLink(firstName: string, lastName: string, email: string, companyId: string): Promise<UserEntity> {
    let user = await this.userRepo.findByEmail(email);
    if (!user) {
      user = await this.userRepo.create(new UserEntity(email, firstName, lastName));
    }
    if (!(await this.userCompanyReaderRepo.isLinked(user.id, companyId))) {
      await this.userCompanyWriterRepo.link(user.id, companyId);
    }
    return user;
  }
}
```

#### 5. Controller — HTTP pur, DTO local, mapper en sortie (`infra/controllers/.../linkUser/`)

```ts
class CreateCompanyUserDto implements CreateCompanyUserBody {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() email: string;
}

@UseGuards(AdminGuard)
@Controller()
export class LinkUserController {
  // …repos + LinkUserUc injectés…

  @Post(CreateCompanyUserRequest.BASE_URL)
  async createOrLink(
    @Param("companySlug") companySlug: string,
    @Body() dto: CreateCompanyUserDto,
  ): Promise<User> {
    const company = await this.companyRepo.findBySlug(companySlug);
    return UserMapper.toResponse(
      await this.linkUserUc.createOrLink(dto.firstName, dto.lastName, dto.email, company.id),
    );
  }
}
```

Le DTO `implements CreateCompanyUserBody` : si le contrat change, le DTO ne compile plus. `UserMapper.toResponse` convertit `Date → string`, zéro `as unknown as`.

#### 6. Wiring NestJS

`LinkUserUc` est fourni dans le module du controller linkUser. Les tokens repo sont déjà agrégés dans `infra/repos/repo.module.ts`.

#### 7. Front — mutation **colocalisée** (pas dans `api/`)

La mutation vit auprès de son déclencheur car elle porte de l'état UI (modale, recherche, sélection). Exemple réel : `front/src/pages/admin/companyDetail/users/useLinkUser.ts` (route sœur `PATCH …/users/:userId/link`, même controller — même pattern de colocalisation).

```ts
export function useLinkUser(companySlug: string /* …, état UI */) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (userId: string) =>
      api.patch(LinkUserRequest.buildUrl(companySlug, userId), {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["companies", companySlug, "users"] });
      toastSuccess("Utilisateur lié");
    },
    onError: toastError,
  });
  // …modalOpen, search, selectedId, liste filtrée…
  return { /* …UI… */ mutation };
}
```

Le composant importe la **query** depuis `api/<domain>`, le **type** depuis `contracts/shared/…`, et déclenche la **mutation** depuis le hook colocalisé. URL via `buildUrl`, jamais hardcodée ; invalidation par la query key concernée.

### Récap de l'ordre

```
contrat → (model si règle hors-table) → abstractions repo → impl repo
        → use case (orchestre) → controller + DTO + mapper → wiring
        → (migration si une entité a changé)
        → query dans api/<domain> + mutation colocalisée + route dans main.tsx (page nouvelle)
```

Si ta feature est un CRUD sans règle métier, saute les étapes 2 et 4 : controller → repo direct → mapper. Le `.uc.ts` et le `model/` n'apparaissent que quand tu peux les nommer.
