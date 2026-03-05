import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    { files: ["src/**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: { ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            "no-console": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": "error",
            "max-lines-per-function": ["error", 60],
            "complexity": ["error", 10]
        }
    },
    {
        files: ["src/tests/**/*.ts", "tests/**/*.ts"],
        rules: {
            "max-lines-per-function": "off",
            "@typescript-eslint/no-explicit-any": "off"
        }
    }
];
