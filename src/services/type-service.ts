import path from 'path';

import fs from 'fs-extra';

import { ensureDirectoryExists } from '../utils/file';
import { renderTemplate } from '../utils/template';

interface CreateTypeOptions {
  name: string;
  path: string;
  createInterface: boolean;
  createType: boolean;
  createEnum: boolean;
  interfaceName?: string;
}

export class TypeService {
  async createType(options: CreateTypeOptions): Promise<void> {
    const {
      name,
      path: basePath,
      createInterface,
      createType,
      createEnum,
      interfaceName,
    } = options;

    // Create the types directory if it doesn't exist
    const typesDir = path.join(process.cwd(), basePath);
    await ensureDirectoryExists(typesDir);

    // Create type file
    const typeContent = await renderTemplate('type/type.ejs', {
      name,
      createInterface,
      createType,
      createEnum,
      interfaceName: interfaceName || '',
    });

    await fs.writeFile(path.join(typesDir, `${name}.ts`), typeContent);
  }
}
