import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended']
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.node } },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended']
  },
  {
    files: ['**/*.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended']
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Best practices
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^(req|res|next)$', varsIgnorePattern: 'dotenv' }
      ],
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'no-trailing-spaces': 'warn',
      curly: ['error', 'all']
    }
  }
]);
