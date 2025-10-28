import path from 'path';

import fs from 'fs-extra';

import { ensureDirectoryExists } from '../utils/file';
import { renderTemplate } from '../utils/template';

interface CreateApiOptions {
  name: string;
  path: string;
  methods: string[];
  withValidation: boolean;
  withDb: boolean;
  isDynamic: boolean;
  dynamicParam?: string;
}

export class ApiService {
  async createApi(options: CreateApiOptions): Promise<void> {
    const {
      name,
      path: basePath,
      methods,
      withValidation,
      withDb,
      isDynamic,
      dynamicParam,
    } = options;

    // Determine the API directory path
    let apiDir: string;

    if (isDynamic) {
      // For dynamic routes, create a directory like [id]
      apiDir = path.join(
        process.cwd(),
        basePath,
        name,
        `[${dynamicParam || 'id'}]`
      );
    } else {
      // For regular API routes
      apiDir = path.join(process.cwd(), basePath, name);
    }

    await ensureDirectoryExists(apiDir);

    // Create route.ts file
    const apiContent = await renderTemplate('api/route.ejs', {
      name,
      methods,
      withValidation,
      withDb,
      isDynamic,
      dynamicParam,
    });

    await fs.writeFile(path.join(apiDir, 'route.ts'), apiContent);
  }
}
