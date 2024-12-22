import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      'prefer-const': 'warn',
      'no-param-reassign': 'warn',
      'prefer-destructuring': ['error', { object: true, array: false }],
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: 'req|res|next|val|error|err' }
      ]
    }
  }
];
