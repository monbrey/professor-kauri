import { common, typescript } from "eslint-config-neon";
import merge from "lodash.merge";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...[...common, ...typescript].map((config) => merge(config, {
    files: ["**/*.ts"],
    rules: {
      "import-x/no-extraneous-dependencies": "off",
      "@stylistic/ts/object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
      "@stylistic/js/array-element-newline": ["error", "always"],
      "@stylistic/ts/lines-between-class-members": [
        "error",
        {
          enforce: [
            { blankLine: "never", prev: "field", next: "field" }
          ]
        }]
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      }
    }
  }))
];