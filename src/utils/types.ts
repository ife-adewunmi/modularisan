export type Levels = 'low' | 'medium' | 'high';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export const DEFAULT_MODULE_COMPONENTS = [
  'components',
  'services',
  'types',
  'hooks',
  'utils',
];

export const MODULE_TEMPLATES = {
  basic: ['components', 'services', 'types'],
  full: ['components', 'services', 'types', 'hooks', 'utils', 'tests'],
  api: ['services', 'types', 'controllers', 'middleware'],
  ui: ['components', 'hooks', 'types', 'styles'],
};
