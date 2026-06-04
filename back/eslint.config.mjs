// @ts-check
import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'
import tseslint from 'typescript-eslint'

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
      'eqeqeq': ['error', 'always'],
      'prettier/prettier': ['error', { endOfLine: 'auto', singleQuote: true, semi: true, trailingComma: 'all' }],
    },
  },
)
