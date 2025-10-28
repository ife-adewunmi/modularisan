import path from 'path';

import fs from 'fs-extra';

import { ensureDirectoryExists } from '../utils/file';
import { renderTemplate } from '../utils/template';

interface CreatePageOptions {
  name: string;
  path: string;
  createLayout: boolean;
  createLoading: boolean;
  createError: boolean;
  createMetadata: boolean;
  isDynamic: boolean;
  dynamicParam?: string;
  isRouteGroup: boolean;
}

export class PageService {
  async createPage(options: CreatePageOptions): Promise<void> {
    const {
      name,
      path: basePath,
      createLayout,
      createLoading,
      createError,
      createMetadata,
      isDynamic,
      dynamicParam,
      isRouteGroup,
    } = options;

    // Determine the page directory path
    let pageDir: string;

    if (isDynamic) {
      // For dynamic routes, create a directory like [id]
      pageDir = path.join(process.cwd(), basePath, `[${dynamicParam || 'id'}]`);
    } else if (isRouteGroup) {
      // For route groups, create a directory like (name)
      pageDir = path.join(process.cwd(), basePath, `(${name})`);
    } else {
      // For regular pages, create a directory with the page name
      pageDir = path.join(process.cwd(), basePath, name);
    }

    await ensureDirectoryExists(pageDir);

    // Create page.tsx file
    const pageContent = await renderTemplate('page/page.ejs', {
      name,
      createMetadata,
      isDynamic,
      dynamicParam,
    });

    await fs.writeFile(path.join(pageDir, 'page.tsx'), pageContent);

    // Create layout.tsx if requested
    if (createLayout) {
      const layoutContent = await renderTemplate('page/layout.ejs', { name });
      await fs.writeFile(path.join(pageDir, 'layout.tsx'), layoutContent);
    }

    // Create loading.tsx if requested
    if (createLoading) {
      const loadingContent = await renderTemplate('page/loading.ejs', {});
      await fs.writeFile(path.join(pageDir, 'loading.tsx'), loadingContent);
    }

    // Create error.tsx if requested
    if (createError) {
      const errorContent = await renderTemplate('page/error.ejs', {});
      await fs.writeFile(path.join(pageDir, 'error.tsx'), errorContent);
    }
  }
}
