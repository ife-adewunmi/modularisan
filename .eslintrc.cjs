module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  ignorePatterns: [
    '**/__tests__/**', 
    '*.test.ts', 
    '*.test.tsx',
    'dist/**',
    'node_modules/**',
    '*.js' // Ignore compiled JS files
  ],
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error', 
      { 
        'argsIgnorePattern': '^_', 
        'varsIgnorePattern': '^_', 
        'caughtErrors': 'none' 
      }
    ],
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/no-require-imports': 'error',
    'import/no-unresolved': 'error',
    'import/namespace': 'off', // Disable namespace checking
    'import/default': 'error',
    'import/no-named-as-default-member': 'off', // Disable this rule
    'import/order': [
      'error', 
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/no-unsafe-*': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      }
    }
  ]
};
