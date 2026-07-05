import js from "@eslint/js";
import globals from "globals";
import tseslint, { parser } from "typescript-eslint";
import { Config, defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import plugin from "eslint-plugin-solid";

const solidFlat = plugin.configs["flat/typescript"] as unknown as Config;

export default defineConfig(
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,cjs,mjs,jsx}"],
    plugins: {
      js,
    },
    extends: [js.configs.recommended],
  },
  {
    files: ["**/*.{ts,cts,mts,tsx}"],

    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser,
        projectService: true,
      },
    },
  },
  solidFlat,
  {
    files: ["eslint.config.ts"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  eslintConfigPrettier,
);
