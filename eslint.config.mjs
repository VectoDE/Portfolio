import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"
import nextPlugin from "@next/eslint-plugin-next"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import tseslint from "typescript-eslint"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

export default [
  {
    ignores: [".next/**", "node_modules/**", "dist/**"],
  },
  ...compat.config({ extends: ["plugin:@next/next/recommended"] }),
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
      "@next/next": nextPlugin,
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
      // Fail closed: next-auth liest das Secret sonst selbst aus process.env und
      // akzeptiert dabei auch einen leeren Wert. Sessions nur über lib/session.ts,
      // Tokens nur in middleware.ts (dort mit geprüftem Secret).
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next-auth",
              importNames: ["getServerSession", "unstable_getServerSession"],
              message: "Use getAppSession() from @/lib/session instead.",
            },
            {
              name: "next-auth/next",
              importNames: ["getServerSession", "unstable_getServerSession"],
              message: "Use getAppSession() from @/lib/session instead.",
            },
            {
              name: "next-auth/jwt",
              importNames: ["getToken"],
              message: "Only middleware.ts may call getToken, with the checked secret.",
            },
            {
              name: "next-auth/middleware",
              message: "withAuth reads the raw secret from process.env; see middleware.ts.",
            },
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
