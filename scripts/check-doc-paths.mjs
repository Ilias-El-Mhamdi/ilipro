#!/usr/bin/env node
// Vérifie que la doc projet ne dérive pas du code en silence.
// Portée (déterministe) : pour chaque lien Markdown `[texte](cible)` de la doc,
//   1. le FICHIER pointé existe encore (refs cliquables) ;
//   2. si la cible porte une `#ancre`, le HEADER correspondant existe dans le
//      fichier cible (slug façon GitHub) — c'est le vecteur de rot le plus
//      fréquent : un titre renommé casse les liens en silence.
// Hors portée (non scriptable) : la prose décrit-elle encore le vrai pattern.
//   Ça, c'est une vérif de revue, pas un check — cf. Definition of Done.
//
// On ignore : URLs externes, mailto, le suffixe `:ligne`, et les blocs de code.
// Les docs scannés sont auto-découverts (CLAUDE.md + docs/*.md) : ajouter un
// doc ne demande PAS d'éditer ce script.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Auto-découverte : CLAUDE.md à la racine + tous les docs/*.md.
const docsDir = resolve(repoRoot, 'docs');
const DOCS = [
  'CLAUDE.md',
  ...(existsSync(docsDir)
    ? readdirSync(docsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => join('docs', f))
    : []),
].filter((d) => existsSync(resolve(repoRoot, d)));

const LINK_RE = /\]\(([^)]+)\)/g;

// Slug façon GitHub : minuscule, ponctuation retirée (on garde lettres unicode,
// chiffres, espaces, `_`, `-`), espaces → `-`. NB : pas de collapse des `-`
// consécutifs (c'est pourquoi « — » entre deux espaces donne `--`).
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

// Retire les blocs de code clôturés (``` ou ~~~) pour ne pas matcher de faux
// liens / faux headers à l'intérieur.
function stripFences(content) {
  const out = [];
  let inFence = false;
  for (const line of content.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    out.push(inFence ? '' : line);
  }
  return out.join('\n');
}

// Ensemble des ancres (slugs de headers) d'un fichier markdown, avec gestion
// des doublons façon GitHub (`titre`, `titre-1`, `titre-2`…).
const anchorCache = new Map();
function anchorsOf(absFile) {
  if (anchorCache.has(absFile)) return anchorCache.get(absFile);
  const anchors = new Set();
  if (existsSync(absFile)) {
    const body = stripFences(readFileSync(absFile, 'utf8'));
    const counts = new Map();
    for (const line of body.split('\n')) {
      const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
      if (!m) continue;
      const base = slugify(m[2]);
      const n = counts.get(base) ?? 0;
      counts.set(base, n + 1);
      anchors.add(n === 0 ? base : `${base}-${n}`);
    }
  }
  anchorCache.set(absFile, anchors);
  return anchors;
}

let broken = 0;
let checkedFiles = 0;
let checkedAnchors = 0;

for (const doc of DOCS) {
  const abs = resolve(repoRoot, doc);
  const docDir = dirname(abs); // liens relatifs au fichier qui les contient
  const content = stripFences(readFileSync(abs, 'utf8'));

  for (const [, rawTarget] of content.matchAll(LINK_RE)) {
    const raw = rawTarget.trim();
    if (/^(https?:|mailto:)/.test(raw)) continue;

    const hash = raw.indexOf('#');
    const pathPart = (hash === -1 ? raw : raw.slice(0, hash)).replace(/:\d+$/, '').trim();
    const anchor = hash === -1 ? '' : raw.slice(hash + 1).trim();
    if (pathPart.startsWith('<')) continue; // placeholder genre <Name>

    // Fichier cible : explicite, ou le doc courant pour une ancre intra-page.
    const targetFile = pathPart ? resolve(docDir, pathPart) : abs;

    if (pathPart) {
      checkedFiles++;
      if (!existsSync(targetFile)) {
        broken++;
        console.error(`✗ ${doc} → fichier introuvable : ${pathPart}`);
        continue; // inutile de vérifier l'ancre d'un fichier absent
      }
    }

    if (anchor && targetFile.endsWith('.md')) {
      checkedAnchors++;
      if (!anchorsOf(targetFile).has(anchor)) {
        broken++;
        const where = pathPart || doc;
        console.error(`✗ ${doc} → ancre introuvable : #${anchor} (dans ${where})`);
      }
    }
  }
}

if (broken > 0) {
  console.error(
    `\n${broken} référence(s) cassée(s). ${checkedFiles} fichier(s) + ${checkedAnchors} ancre(s) vérifié(s). Mets la doc à jour.`,
  );
  process.exit(1);
}
console.log(`✓ Doc à jour : ${checkedFiles} fichier(s) + ${checkedAnchors} ancre(s) valides.`);
