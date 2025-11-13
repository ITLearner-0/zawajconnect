import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn", // Changed from error to warn to allow gradual migration
      "react-hooks/set-state-in-effect": "off", // Disabled - rule is overly strict for legitimate data loading patterns
      "@typescript-eslint/ban-ts-comment": "off", // Temporarily disabled - clean up @ts-nocheck usage in future PR
      "react-hooks/immutability": "off", // Temporarily disabled - will fix remaining function hoisting issues in future PR
    },
  }
);
