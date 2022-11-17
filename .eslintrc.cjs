/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', 'airbnb-base'],
  rules: {
    'max-len': 'off',
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always',
      },
    }],
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 10,
      },
      multiline: {
        max: 1,
      },
    }],
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
  },
  parserOptions: {
    ecmaVersion: 'latest',
  },
};
