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
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          Function: false
        }
      }
    ],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_"
      }
    ],
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    "jest/expect-expect": [
      "warn",
      {
        assertFunctionNames: ["expect*"]
      }
    ]
  }
}
