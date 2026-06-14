# Contracts — templates & exemples

Le _quoi_ et les _règles_ vivent dans [`CLAUDE.md` § Contracts](../CLAUDE.md#contracts). Ce fichier porte les **exemples copiables** : patrons de code qu'on reproduit en ajoutant une route, déportés ici pour garder CLAUDE.md opérationnel.

## `*.request.ts` — `BASE_URL` + `buildUrl`

```ts
// getCompany.request.ts — avec params URL
export class GetCompanyRequest {
  static BASE_URL = "/companies/:slug";
  static buildUrl(slug: string) {
    return `/companies/${slug}`;
  }
}

// listCompanies.request.ts — sans params : buildUrl retourne BASE_URL (zéro duplication de chaîne)
export class ListCompaniesRequest {
  static BASE_URL = "/companies";
  static buildUrl() {
    return ListCompaniesRequest.BASE_URL;
  }
}
```

`BASE_URL` est réservé au back (décorateurs `@Get/@Post/…`). Le front appelle **toujours** `buildUrl(…)`, jamais d'URL hardcodée.

## Usage end-to-end

```ts
// back — controller : BASE_URL dans le décorateur, type de retour ancré au contrat
import { GetCompanyRequest } from "platform/contracts/adminDashboard/companies/getCompany/getCompany.request";
import { Company } from "platform/contracts/shared/company";

@Get(GetCompanyRequest.BASE_URL)
async getCompany(@Param('slug') slug: string): Promise<Company> { … }
```

```ts
// front — api hook : buildUrl pour l'URL, fromJson pour parser
import { GetCompanyRequest } from "platform/contracts/adminDashboard/companies/getCompany/getCompany.request";
import { Company } from "platform/contracts/shared/company";

const data = Company.fromJson(await api.get(GetCompanyRequest.buildUrl(slug)));
```

## Type shared — classe avec schema zod

Le schema est la source de vérité : il valide au runtime, les `declare` exposent les champs à TypeScript sans émettre de JS (compatible `erasableSyntaxOnly`).

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

- `fromJson` lève une erreur explicite si un champ manque ou est mal typé — zéro cast aveugle. `fromJson` pour un objet, `fromJsonList` pour un tableau.
- zod est installé à la racine du monorepo (`/package.json`) pour que la résolution fonctionne depuis `platform/contracts/`, que ce soit le front ou le back qui compile.
- **Un sous-type objet imbriqué est lui aussi une classe** avec son `static schema` + `declare` + `fromJson` ; la classe parente référence le schema enfant (`machines: z.array(LicenseMachine.schema)`) — cf. `License` / `LicenseMachine` / `LicenseProject` dans [`../platform/contracts/shared/license.ts`](../platform/contracts/shared/license.ts). Seuls les **enums** (unions de chaînes, ex. `LicenseTypeSchema`) restent des `z.enum`, pas des classes.
- Les types **composites** (absents de `shared/`) définissent leur propre classe avec `fromJson`/`fromJsonList` dans leur `*.response.ts`.

## Mapper entité → contrat

Les entités TypeORM ont des champs `Date` ; les contrats ont des `string`. La conversion se fait dans `back/src/infra/mappers/` — **zéro `as unknown as` dans les controllers**.

```
infra/mappers/
  company.mapper.ts     ← CompanyMapper.toResponse(entity): Company
  user.mapper.ts        ← UserMapper.toResponse(entity): User  +  toCompanyUser(user, license): CompanyUser
  project.mapper.ts     ← ProjectMapper.toResponse / toResponseList
  license.mapper.ts     ← LicenseMapper.toResponse (mappe aussi les nested machines/projectAccess)
  deliverable.mapper.ts ← DeliverableMapper.toResponse / toResponseList
  readProfile.mapper.ts ← ReadProfileMapper.toResponse (profil utilisateur imbriqué, colocalisé)
```

```ts
// pattern controller
@Get(LIST_BASE)
async findAll(): Promise<Company[]> {
  return CompanyMapper.toResponseList(await this.readerRepo.findAll());
}

@Get(GET_BASE)
async findBySlug(@Param('slug') slug: string): Promise<Company> {
  return CompanyMapper.toResponse(await this.readerRepo.findBySlug(slug));
}
```

- `Object.assign(new ResponseClass(), { ...fields })` crée une vraie instance du contrat.
- Les mappers vivent dans `infra/` (pas `core/`) car ils connaissent les entités TypeORM **et** les classes contrat.
- Un mapper par entité ; méthodes spécialisées si la réponse est composite (ex. `toCompanyUser`).

## DTO back — `implements` le body + décorateurs `@Is*`

```ts
// dans le controller ou un sibling *.dto.ts
import type { CreateCompanyBody } from "platform/contracts/adminDashboard/companies/createCompany/createCompany.body";
import { IsString, MinLength } from "class-validator";

class CreateCompanyDto implements CreateCompanyBody {
  @IsString()
  @MinLength(2)
  name: string;
}
```

TypeScript garantit l'alignement : si le `*.body` du contrat change, le DTO ne compile plus jusqu'à mise à jour. `ValidationPipe` est global — aucun pipe manuel par route.
