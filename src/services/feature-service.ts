import path from 'path';

import fs from 'fs-extra';

import { ensureDirectoryExists } from '../utils/file';
import { logInfo, logError } from '../utils/logger';
import { renderTemplate } from '../utils/template';

interface CreateFeatureOptions {
  name: string;
  path: string;
  components: string[];
  createIndex: boolean;
  componentName?: string;
  createPage?: boolean;
  rootDir?: string;
}

export class FeatureService {
  async createFeature(options: CreateFeatureOptions): Promise<void> {
    const {
      name,
      path: basePath,
      components,
      createIndex,
      componentName,
      createPage,
      rootDir = process.cwd(),
    } = options;

    try {
      // Create the feature directory
      const featurePath = path.join(rootDir, basePath, name);
      await ensureDirectoryExists(featurePath);
      logInfo(`Creating feature directory: ${featurePath}`);

      // Create subdirectories based on selected components
      for (const component of components) {
        await ensureDirectoryExists(path.join(featurePath, component));
        logInfo(`Creating ${component} directory`);
      }

      // Create index.ts file if requested
      if (createIndex) {
        try {
          const indexContent = await renderTemplate('feature/index.ejs', {
            name,
          });
          await fs.writeFile(path.join(featurePath, 'index.ts'), indexContent);
          logInfo('Creating index.ts file');
        } catch (error) {
          logError(
            `Failed to create index.ts file: ${(error as Error).message}`
          );
          // Fallback to a simple index file
          const fallbackContent = `// Export all components from this feature\nexport * from './components'\n`;
          await fs.writeFile(
            path.join(featurePath, 'index.ts'),
            fallbackContent
          );
          logInfo('Created fallback index.ts file');
        }
      }

      // Create a component if requested
      if (componentName && componentName.length > 0) {
        if (components.includes('components')) {
          try {
            const componentContent = await renderTemplate(
              'component/functional.ejs',
              {
                name: componentName,
                withProps: true,
                isClientComponent: true,
              }
            );

            await fs.writeFile(
              path.join(featurePath, 'components', `${componentName}.tsx`),
              componentContent
            );
            logInfo(`Creating component: ${componentName}.tsx`);

            // Create index.ts in components directory
            try {
              const componentsIndexContent = await renderTemplate(
                'component/index.ejs',
                {
                  name: componentName,
                }
              );

              await fs.writeFile(
                path.join(featurePath, 'components', 'index.ts'),
                componentsIndexContent
              );
              logInfo('Creating components/index.ts file');
            } catch (error) {
              logError(
                `Failed to create components/index.ts file: ${(error as Error).message}`
              );
              // Fallback to a simple index file
              const fallbackContent = `export * from './${componentName}'\n`;
              await fs.writeFile(
                path.join(featurePath, 'components', 'index.ts'),
                fallbackContent
              );
              logInfo('Created fallback components/index.ts file');
            }
          } catch (error) {
            logError(`Failed to create component: ${(error as Error).message}`);
          }
        }
      }

      // Create a page file if requested
      if (createPage) {
        try {
          const pagePath = path.join(rootDir, 'src/app', name);
          await ensureDirectoryExists(pagePath);

          const pageContent = await renderTemplate('page/page.ejs', {
            name,
            createMetadata: true,
            isDynamic: false,
          });

          await fs.writeFile(path.join(pagePath, 'page.tsx'), pageContent);
          logInfo(`Creating page file: src/app/${name}/page.tsx`);
        } catch (error) {
          logError(`Failed to create page file: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      throw new Error(`Failed to create feature: ${(error as Error).message}`);
    }
  }
}
