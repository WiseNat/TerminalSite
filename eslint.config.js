import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import css from "@eslint/css";
import { defineConfig, globalIgnores } from "eslint/config";
import sonarjs from "eslint-plugin-sonarjs";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js, sonarjs, "@stylistic": stylistic },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quotes": ["error", "double"],
      eqeqeq: ["error", "smart"],
      "@typescript-eslint/naming-convention": [
        "error",

        // Destructured Variables (ignore formatting as per https://typescript-eslint.io/rules/naming-convention/#ignore-destructured-names)
        {
          selector: "variable",
          modifiers: ["destructured"],
          format: null,
        },

        // Variables (not Global Const)
        {
          selector: "variable",
          format: ["camelCase"],
        },

        // Global Const Variables
        {
          selector: "variable",
          modifiers: ["const", "global"],
          format: ["UPPER_CASE"],
        },

        // Classes
        {
          selector: "class",
          format: ["PascalCase"],
        },

        // Functions
        {
          selector: "function",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },

        // Enums
        {
          selector: "enum",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE"],
        },
      ],
    },
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
  ...tseslint.configs.recommended,
  globalIgnores(["dist/"]),
]);
