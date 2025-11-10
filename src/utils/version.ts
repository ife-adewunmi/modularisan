import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../../package.json');

export const getPackageVersion = (): string => {
  try {
    const packageJson = fs.readJsonSync(packageJsonPath);
    return packageJson.version;
  } catch (error) {
    return '1.0.0-beta.1'; // Fallback version
  }
};