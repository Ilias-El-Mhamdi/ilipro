import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { react, import: importPlugin },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],
      'react/jsx-no-useless-fragment': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],

      // ── Frontières d'architecture (cf. CLAUDE.md) ──────────────────────
      // Importe contrats & utils partagés via l'alias `platform/...`, jamais en relatif.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../**/platform/*', '../**/platform/**'],
              message:
                'Importe le code partagé via l’alias `platform/...`, pas en chemin relatif.',
            },
          ],
        },
      ],
      // Zones de couches : résolues sur le fichier réel (robuste aux relatifs).
      'import/no-restricted-paths': [
        'error',
        {
          basePath: import.meta.dirname,
          zones: [
            // lib/ = utilitaires purs : pas de data layer, pas de hook, pas d'UI.
            // (lib PEUT référencer un type contrat pour des maps de constantes, ex. licenseConstants.)
            { target: './src/lib', from: './src/api', message: 'lib/ : pas de data layer (api/). Une fonction qui fetch n’est pas un utilitaire pur.' },
            { target: './src/lib', from: './src/hooks' },
            { target: './src/lib', from: './src/components' },
            // hooks/ = génériques UI : react only (pas api/lib/platform/components).
            { target: './src/hooks', from: './src/api', message: 'hooks/ = générique UI (react only). Un hook business se colocalise.' },
            { target: './src/hooks', from: './src/components' },
            { target: './src/hooks', from: '../platform/contracts', message: 'hooks/ = générique UI : importe un contrat → c’est un business hook, colocalise-le.' },
            // components/ui = design system : zéro métier.
            { target: './src/components/ui', from: './src/api', message: 'ui/ = design system, zéro connaissance métier.' },
            { target: './src/components/ui', from: '../platform/contracts', message: 'ui/ = design system, zéro type métier.' },
            // Data layer ne remonte jamais vers l'UI.
            { target: './src/api', from: './src/pages', message: 'api/ ne dépend pas des pages (flux UI → api, jamais l’inverse).' },
            { target: './src/api', from: './src/components' },
            // Une page n'importe pas d'un autre groupe de pages (duplicate, don't share).
            { target: './src/pages/admin', from: './src/pages/user', message: 'Une page n’importe pas d’un autre groupe de pages — duplique, ou remonte le partagé dans components/.' },
            { target: './src/pages/admin', from: './src/pages/login', message: 'Une page n’importe pas d’un autre groupe de pages — duplique, ou remonte le partagé dans components/.' },
            { target: './src/pages/user', from: './src/pages/admin', message: 'Une page n’importe pas d’un autre groupe de pages — duplique, ou remonte le partagé dans components/.' },
            { target: './src/pages/user', from: './src/pages/login', message: 'Une page n’importe pas d’un autre groupe de pages — duplique, ou remonte le partagé dans components/.' },
            { target: './src/pages/login', from: './src/pages/admin', message: 'Une page n’importe pas d’un autre groupe de pages — duplique, ou remonte le partagé dans components/.' },
            { target: './src/pages/login', from: './src/pages/user', message: 'Une page n’importe pas d’un autre groupe de pages — duplique, ou remonte le partagé dans components/.' },
          ],
        },
      ],
    },
  },
]);
