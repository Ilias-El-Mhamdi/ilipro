# Plan Infrastructure — ilipro

## Stack applicative

| Couche | Choix |
|---|---|
| Frontend | React + Vite + Tailwind + shadcn/ui |
| Backend | NestJS + architecture hexagonale |
| Base de données | PostgreSQL + Prisma |
| Stockage fichiers | MinIO (local) → Bunny Storage (prod) |
| Vidéos Docusaurus | Bunny Stream |
| Reverse proxy | Caddy |
| DNS / SSL | Cloudflare |

---

## Architecture cible (production)

```
VPS Hetzner CX32 (~13€/mois)
└── k3s (single node)
      ├── NestJS (Deployment)
      ├── React / Nginx (Deployment)
      └── PostgreSQL (StatefulSet + hostPath)

Bunny (~1-2$/mois)
├── Stream   ← vidéos Docusaurus par projet
└── Storage  ← documents et livrables

Cloudflare ← DNS + SSL
```

**Total estimé : ~15€/mois**

---

## Infrastructure locale (dev)

```
docker-compose
├── PostgreSQL :5432
└── MinIO :9000 (console :9001)
```

```bash
cd infra && make up    # démarrer
cd infra && make down  # arrêter
cd infra && make reset # tout supprimer (données incluses)
```

---

## IaC — Terraform + k3s

- Provider : **Hetzner** (terraform-provider-hcloud)
- Orchestration : **k3s** (single node, stateless)
- Terraform provisionne :
  - VPS Hetzner CX32
  - Firewall rules
  - DNS via Cloudflare provider
  - Installation k3s via cloud-init
- Manifests K8s versionnés dans ce repo

### Pourquoi k3s sur un seul nœud

- Portabilité : même manifests pour migrer vers EKS / GKE / Kapsule
- Cluster stateless → `terraform destroy` + `terraform apply` recrée tout en ~5 min
- Pas de volume externe : stockage embarqué dans le pod (hostPath)

---

## Stockage fichiers

### Local (dev) — MinIO
- Bucket `ilipro` créé automatiquement au démarrage
- Policy lecture publique appliquée à l'init
- Compatible API S3

### Production — Bunny Storage
- Même interface S3 → zéro changement de code
- Pour switcher : changer `activeStorage` dans `back/src/storage/storage.module.ts`

```ts
// storage.module.ts — une seule ligne à changer
const activeStorage = MinioStorageService; // ou BunnyStorageService
```

---

## Backup (manuel)

```bash
make backup   # depuis la racine du projet
```

1. `pg_dump` → `~/backups/ilipro/db.sql.gz`
2. `rclone sync bunny:storage` → `~/backups/ilipro/files/`

### Restauration après perte du VPS

```bash
terraform apply    # recrée VPS + k3s (~5 min)
./restore.sh       # réinjecte PostgreSQL + fichiers Bunny
```

---

## Repos Git

```
ilipro/
├── front/    ← React + Vite
├── back/     ← NestJS
└── infra/    ← Terraform + manifests K8s + docker-compose dev
```

---

## Estimations

| Poste | Volume estimé (6 mois) |
|---|---|
| PostgreSQL | ~1-2 GB |
| Documents / livrables | ~10 GB |
| Vidéos Docusaurus | ~10 GB |
| Disque VPS utilisé | ~20 GB / 80 GB disponibles |

**Utilisateurs max : 20**
