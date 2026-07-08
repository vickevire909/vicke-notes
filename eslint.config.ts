import js from '@eslint/js';
import globals from 'globals';
import tseslint, { parser } from 'typescript-eslint';
import { Config, defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import plugin from 'eslint-plugin-solid';
import pluginRouter from '@tanstack/eslint-plugin-router';

const solidFlat = plugin.configs['flat/typescript'] as unknown as Config;
const routerFlat = pluginRouter.configs['flat/recommended'];

export default defineConfig(
  globalIgnores(['dist', '**/routeTree.gen.ts']),
  {
    files: ['**/*.{js,cjs,mjs,jsx}'],
    plugins: {
      js,
    },
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.{ts,cts,mts,tsx}'],

    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser,
        projectService: true,
      },
    },
  },
  solidFlat,
  routerFlat,
  {
    rules: {
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: 'Redirect',
            },
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: 'NotFoundError',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['eslint.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  eslintConfigPrettier
);
