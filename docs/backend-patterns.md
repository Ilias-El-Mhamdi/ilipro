# Patterns — rationnel approfondi (front + back)

Ce fichier porte le **pourquoi** des patterns d'ilipro, des deux côtés. Le [`CLAUDE.md`](../CLAUDE.md) garde les **règles** compactes ; viens ici quand tu veux la justification complète d'un choix qui paraît verbeux. Aucune règle nouvelle ici — uniquement le rationnel derrière celles du CLAUDE.md.

---

## Couple reader/writer — pourquoi 4 fichiers par table

**Règle (CLAUDE.md).** Chaque entité CRUD 1:1 expose deux abstractions indépendantes (`*.reader.abstract-repo.ts` / `*.writer.abstract-repo.ts`) implémentées par **une seule** classe concrète. Ne pas collapser, ne pas dupliquer.

**Pourquoi cette cérémonie.** Oui, c'est 4 fichiers par table (entity + reader + writer + repo) pour une seule classe concrète derrière deux tokens. C'est délibéré :

- **Payoff = narrowing typé au point d'injection.** Un flow de lecture qui injecte `IUserReaderRepo` ne *voit* pas `delete()` : la violation de couche devient une erreur de compilation, pas un point de revue de code. C'est tout l'intérêt — on paye la verbosité une fois, on gagne la garantie à chaque injection.
- **Indépendance des abstractions.** Reader et writer n'héritent pas l'un de l'autre. La ségrégation vit au niveau du **contrat**, pas de l'implémentation.
- **Zéro duplication.** Une seule classe concrète implémente les deux interfaces ; `repo.module.ts` relie les deux tokens à la même instance via `useExisting`.

**À ne pas faire.** Collapser reader+writer en une abstraction unique « pour faire court », ou dupliquer la logique entre deux classes concrètes. On suit le pattern même quand il paraît cérémonieux. Un repo qui n'est pas un CRUD 1:1 relève du **read repo** (ci-dessous), pas du couple.

---

## Read repo — où vit le read model

**Règle (CLAUDE.md).** Lecture multi-tables ou sans table → une abstraction unique (read repo), pas un couple reader/writer. Pas de méthode d'écriture CRUD générique dessus.

**Où vit la forme du read model.** Tant que `core/models/` n'existe pas, la forme du read model est déclarée en `interface` **dans le fichier de l'abstract-repo** (cf. `MemberProfile` / `CompanyProfile` dans [`readProfile.abstract-repo.ts`](../back/src/core/repos/readProfile/readProfile.abstract-repo.ts)). Elle migrera vers une classe `core/models/*.model.ts` le jour où elle portera de la **logique** de domaine — aujourd'hui c'est une projection passive, donc une simple interface suffit. `core/models/` n'apparaît qu'au moment où une première classe le justifie, pas en prévision (même logique que les hooks et les `.uc.ts`).

---

## Duplication vs decoupling — exemple Sidebar

**Règle (CLAUDE.md).** Duplication intentionnelle > DRY forcé quand deux composants servent des intentions différentes. *Incidental similarity ≠ conceptual identity.*

**Exemple réel.** [`components/sidebar/Sidebar.tsx`](../front/src/components/sidebar/Sidebar.tsx) (admin : arbre companies + liste users + recherche transverse) et [`components/sidebar/userSidebar/UserSidebar.tsx`](../front/src/components/sidebar/userSidebar/UserSidebar.tsx) (user : scopé à ses propres companies) partagent la même coquille visuelle (logout, `VersionBadge`, nav) mais portent des intentions opposées — pilotage global vs consommation de son propre périmètre. Deux implémentations indépendantes, **aucun cross-import** : elles évoluent séparément, on ne les fusionne pas. La ressemblance est incidentelle ; les faire diverger librement coûte moins cher que de maintenir une abstraction partagée qui devrait gérer les deux intentions.

---

## Mutation colocalisée — pourquoi pas dans `api/`

**Règle (CLAUDE.md).** Les `useMutation` ne vivent pas dans `api/<domain>` (qui ne porte que des queries) : une mutation se colocalise avec le composant/hook qui la déclenche.

**Pourquoi.** Une mutation est attachée à une **action d'UI précise** et porte presque toujours de l'état UI local autour d'elle — `modalOpen`, champ de recherche, sélection courante. La séparer de cet état pour la ranger dans un fichier `api/` partagé n'a pas de sens : on couperait la mutation de la moitié de son contexte. Une query, à l'inverse, est un cache partagé keyé que plusieurs composants relisent — sa place est centralisée dans `api/<domain>`.

**Exemple réel.** [`useLinkUser.ts`](../front/src/pages/admin/companyDetail/users/useLinkUser.ts) colocalise sa `useMutation` (liaison user↔company) avec l'état de la modale de liaison, et invalide la query key `['companies', slug, 'users']` après succès.

---

## Forwarding de type interdit — pourquoi `api/` ne re-exporte pas un contrat

**Règle (CLAUDE.md).** `api/<domain>.ts` n'exporte que ce qu'il **définit** (ses hooks, un type composite local). Il **importe** un type contrat pour parser mais ne le re-exporte jamais. Le composant importe le type directement depuis `platform/contracts/`.

**Pourquoi.** Un re-export de forwarding (`export { Company } from 'platform/contracts/...'` depuis `api/companies`) **masque la source de vérité** : un lecteur qui voit `import { Company } from '../api/companies'` croit que le type est défini là, et doit ouvrir le fichier pour découvrir que ce n'est qu'un relais. C'est une indirection gratuite à la lecture. Le seul endroit où re-exporter un contrat est légitime, c'est un `*.response.ts` **dans `contracts/`** : là, la source (`shared/`) est voisine et le re-export exprime « cette réponse *est* exactement ce type shared ».

---

## `hooks/` — le test de dépendance binaire

**Règle (CLAUDE.md).** `hooks/` ne contient que des hooks **génériques UI** (import `react` uniquement). Dès qu'un hook importe `api/`, `lib/api`, `lib/toast`, `contracts/` ou un type métier → **business hook**, il se colocalise.

**Pourquoi binaire.** Le test « pourrais-je publier ce hook sur npm et le réutiliser dans une app sans rapport avec ilipro ? » tranche sans débat : un `useCarousel` ou `useClipboard` ne sait rien du domaine, il est portable → `hooks/` ; un hook qui touche au domaine ne l'est pas → colocalisé. La **nature** (générique vs business) décide l'éligibilité à `hooks/` ; la **portée** décide ensuite *où* va le business hook (un seul consommateur → colocalisé ; ≥2 pages → `components/`, **jamais** `hooks/`).
