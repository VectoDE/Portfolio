import js from "@eslint/js"
import nextPlugin from "@next/eslint-plugin-next"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "out/**", "build/**", "coverage/**", "public/**"],
  },
  {
    // Config files and scripts at the root run in Node.
    files: ["**/*.{mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    // CI page scripts: Node, plus functions passed to page.evaluate that run in the browser.
    files: [".github/e2e/**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  nextPlugin.configs.recommended,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      next: {
        rootDir: ["app/*/", "pages/*/", "src/*/"],
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: [
            "metadata",
            "generateMetadata",
            "dynamic",
            "revalidate",
            "runtime",
            "preferredRegion",
            "maxDuration",
            "badgeVariants",
            "buttonVariants",
            "Form",
            "navigationMenuTriggerStyle",
            "sidebarMenuButtonVariants",
            "toastVariants",
            "toggleVariants",
          ],
        },
      ],
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-sync-scripts": "error",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_", // Add this to ignore unused variables (including type parameters) starting with an underscore
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]
