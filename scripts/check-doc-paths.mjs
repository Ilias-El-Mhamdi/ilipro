#!/usr/bin/env node
// Vérifie que tout lien-fichier cité dans la doc projet existe encore.
// But : empêcher CLAUDE.md / docs de dériver du code en silence.
// Portée : les liens Markdown `[texte](chemin)` pointant vers un fichier local
// (les refs cliquables). On ignore URLs, ancres, et le suffixe `:ligne`.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const DOCS = ['CLAUDE.md', 'docs/architecture.md'];
const LINK_RE = /\]\(([^)]+)\)/g;

let missing = 0;
let checked = 0;

for (const doc of DOCS) {
  const abs = resolve(repoRoot, doc);
  if (!existsSync(abs)) continue;
  const docDir = dirname(abs); // les liens sont relatifs au fichier qui les contient
  const content = readFileSync(abs, 'utf8');

  for (const [, raw] of content.matchAll(LINK_RE)) {
    // Ignore URLs externes, ancres, mailto.
    if (/^(https?:|mailto:|#)/.test(raw)) continue;
    // Retire un éventuel suffixe :ligne (ex. app.module.ts:104).
    const path = raw.replace(/:\d+$/, '').trim();
    if (!path || path.startsWith('<')) continue; // placeholder

    checked++;
    if (!existsSync(resolve(docDir, path))) {
      missing++;
      console.error(`✗ ${doc} → chemin introuvable : ${path}`);
    }
  }
}

if (missing > 0) {
  console.error(`\n${missing} lien(s) cassé(s) sur ${checked} vérifié(s). Mets la doc à jour.`);
  process.exit(1);
}
console.log(`✓ ${checked} liens-fichiers de la doc existent tous.`);
