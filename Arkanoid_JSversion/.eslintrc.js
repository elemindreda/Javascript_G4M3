module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    indent: [2, 2, { SwitchCase: 1 }],
    'linebreak-style': 0,
  },
};
