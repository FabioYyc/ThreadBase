/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // Make sure this is always the last configuration in the extends array.
  ],
  plugins: [
    "@typescript-eslint",
    "prettier", // This enables eslint-plugin-prettier.
  ],
  rules: {
    "prettier/prettier": "error", // This turns on the prettier rules.
  },
};
