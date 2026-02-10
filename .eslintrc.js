module.exports = {
  env: {
    es2018: true,
    node: true,
    jest: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "prettier", "jest"],
  rules: {
    "@typescript-eslint/no-empty-function": [
      "error",
      {
        allow: ["arrowFunctions"]
      }
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }
    ],
    "@typescript-eslint/no-var-requires": "off",
    "jest/expect-expect": [
      "warn",
      {
        assertFunctionNames: ["expect*"]
      }
    ]
  }
}
