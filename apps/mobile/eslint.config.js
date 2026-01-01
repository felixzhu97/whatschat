const reactNativePlugin = require("eslint-plugin-react-native");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      "node_modules/",
      ".expo/",
      "dist/",
      "build/",
      "coverage/",
      "*.log",
      ".DS_Store",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptPlugin.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.es2020,
        ...globals.node,
        "react-native/react-native": true,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      react: reactPlugin,
      "react-native": reactNativePlugin,
    },
    parser: "@babel/eslint-parser",
    rules: {
      ...typescriptPlugin.configs["recommended"].rules,
      ...reactPlugin.configs["recommended"].rules,
      ...reactNativePlugin.configs["all"].rules,
      "react-native/no-unused-styles": "warn",
      "react-native/split-platform-components": "warn",
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "warn",
      "react-native/no-raw-text": "warn",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
