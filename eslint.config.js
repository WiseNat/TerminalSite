import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import css from "@eslint/css";
import {defineConfig, globalIgnores} from "eslint/config";
import sonarjs from 'eslint-plugin-sonarjs';

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        plugins: {js, sonarjs},
        extends: ["js/recommended"],
        languageOptions: {globals: globals.browser}
    },
    {
        files: ["**/*.jsonc"],
        plugins: {json},
        language: "json/jsonc",
        extends: ["json/recommended"]
    },
    {
        files: ["**/*.css"],
        plugins: {css},
        language: "css/css",
        extends: ["css/recommended"]
    },
    ...tseslint.configs.recommended,
    globalIgnores(["dist/"])
]);
