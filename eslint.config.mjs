// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      'learning-site/vendor/**',
      'learning-site/search-index.js',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  {
    files: ['practice-suite/**/*.{ts,tsx}'],
    ...playwright.configs['flat/recommended'],
  },
  {
    files: ['tools/**/*.{js,mjs}', 'learning-site/**/*.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        location: 'readonly',
        history: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        CustomEvent: 'readonly',
        MiniSearch: 'readonly',
        indexedDB: 'readonly',
        IDBKeyRange: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        fetch: 'readonly',
        Buffer: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
