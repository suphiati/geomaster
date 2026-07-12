// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'data/countries/_generated.ts'],
  },
  {
    rules: {
      // Türkçe metinlerde apostrof yaygın; JSX içinde escape zorunluluğu kaldırıldı.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
