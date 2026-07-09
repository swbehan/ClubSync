import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // frontend has its own config; node_modules/dist aren't ours to lint
  globalIgnores(["frontend/**", "node_modules/**", "dist/**"]),
  {
    files: ["**/*.js"],
    extends: [js.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: "latest", // allows modern syntax incl. top-level await (db/config.js uses it)
      sourceType: "module", // your backend uses import/export, not require
      globals: { ...globals.node }, // tells ESLint about `process`, `console`, etc.
    },
  },
]);
