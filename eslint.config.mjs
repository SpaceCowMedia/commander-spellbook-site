import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import cypress from "eslint-plugin-cypress";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends(
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:prettier/recommended",
        "next/core-web-vitals",
    ),
    cypress.configs.recommended,
    {
        plugins: {
            react,
            reactHooks,
            prettier,
            cypress,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            "react/no-deprecated": "warn",
            "react/no-direct-mutation-state": "error",
            "react/no-unescaped-entities": "off",
            "react-hooks/exhaustive-deps": "off",
            "@next/next/no-img-element": "off",

            "prettier/prettier": ["error", {
                trailingComma: "all",
                eslintIntegration: true,
                printWidth: 120,
                singleQuote: true,
            }],

            "no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
            }],

            curly: ["error", "all"],
        },
    },
    {
        files: ["**/*.config.js", "**/*.config.ts", "**/*.config.mjs"],

        rules: {
            "import/no-anonymous-default-export": "off",
        },
    },
];