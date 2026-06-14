// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['eslint.config.mjs', 'dist', 'node_modules', 'generated'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: { import: importPlugin },
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'prettier/prettier': ['error', { endOfLine: 'auto', singleQuote: true, semi: true, trailingComma: 'all' }],

      // ── Frontières d'architecture (cf. CLAUDE.md) ──────────────────────
      // Le domaine ne dépend jamais de l'infra : infra → core, jamais l'inverse.
      'import/no-restricted-paths': [
        'error',
        {
          basePath: import.meta.dirname,
          zones: [
            { target: './src/core', from: './src/infra', message: 'core/ (domaine) ne dépend pas de infra/. Le flux va infra → core, jamais l’inverse.' },
            { target: './src/core/utils', from: './src/core/repos', message: 'core/utils = TS pur, aucune dépendance domaine.' },
            { target: './src/core/utils', from: './src/core/flows', message: 'core/utils = TS pur, aucune dépendance domaine.' },
          ],
        },
      ],
    },
  },
  {
    // `as unknown as` interdit dans les controllers : convertir via un mapper.
    files: ['src/infra/controllers/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "TSAsExpression[typeAnnotation.type='TSUnknownKeyword']",
          message: '`as unknown as` interdit dans un controller : convertis l’entité via un mapper (infra/mappers/), pas un cast aveugle.',
        },
      ],
    },
  },
);
