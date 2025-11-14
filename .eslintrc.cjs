/* eslint-env node */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "eslint:recommended", "plugin:react/recommended", "prettier"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    "react/react-in-jsx-scope": "off"
  }
};
