import path from 'path';

import chalk from 'chalk';
import type { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';

import { ConfigManager } from '../core/config-manager';
import { FrameworkDetector } from '../core/framework-detector';
import { ensureDirectoryExists } from '../utils/file';
import { logSuccess, logError, logInfo } from '../utils/logger';

export function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize Modularisan configuration for your project')
    .option('-f, --framework <framework>', 'Force specific framework detection')
    .option('-d, --directory <dir>', 'Project root directory', process.cwd())
    .option(
      '--standalone',
      'Enable standalone modules (each with package.json)'
    )
    .option('--no-typescript', 'Disable TypeScript support')
    .option('--no-testing', 'Disable testing support')
    .option('-y, --yes', 'Skip interactive prompts and use defaults')
    .action(async (options) => {
      try {
        const rootDir = path.resolve(options.directory);
        logInfo(`Initializing Modularisan in: ${rootDir}`);

        // Check if already initialized
        const configManager = new ConfigManager(rootDir);
        if (await configManager.hasConfig()) {
          const { overwrite } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message:
                'Modularisan is already initialized. Do you want to overwrite the configuration?',
              default: false,
            },
          ]);

          if (!overwrite) {
            logInfo('Initialization cancelled.');
            return;
          }
        }

        // Detect framework
        const detector = new FrameworkDetector(rootDir);
        let projectStructure;

        try {
          projectStructure = await detector.detectFramework();

          if (options.framework) {
            const supportedFrameworks =
              FrameworkDetector.getSupportedFrameworks();
            if (!supportedFrameworks.includes(options.framework)) {
              throw new Error(
                `Unsupported framework: ${options.framework}. Supported: ${supportedFrameworks.join(', ')}`
              );
            }

            // Override detected framework
            logInfo(`Overriding detected framework with: ${options.framework}`);
            // You'd implement framework override logic here
          }
        } catch (error) {
          logError(`Framework detection failed: ${(error as Error).message}`);

          // Fallback to manual selection
          const { framework } = await inquirer.prompt([
            {
              type: 'list',
              name: 'framework',
              message: 'Please select your framework:',
              choices: [
                { name: 'Next.js (React + SSR)', value: 'next' },
                { name: 'React (Frontend only)', value: 'react' },
                { name: 'Vue.js', value: 'vue' },
                { name: 'Nuxt.js (Vue + SSR)', value: 'nuxt' },
                { name: 'Nest.js (Node.js Backend)', value: 'nest' },
                { name: 'Express.js (Node.js Backend)', value: 'express' },
                { name: 'Svelte', value: 'svelte' },
                { name: 'Angular', value: 'angular' },
              ],
            },
          ]);

          // Create minimal project structure for manual framework
          projectStructure = {
            framework: detector['getFrameworkConfig'](framework),
            hasTypeScript: options.typescript !== false,
            hasTesting: options.testing !== false,
            packageManager: 'npm' as const,
            rootDir,
          };
        }

        // Interactive configuration if not using --yes flag
        let configOptions = {};

        if (!options.yes) {
          const answers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'standaloneModules',
              message:
                'Enable standalone modules (each module has its own package.json)?',
              default: options.standalone || false,
            },
            {
              type: 'confirm',
              name: 'packagePerModule',
              message: 'Create package.json file for each module?',
              default: false,
              when: (answers) => answers.standaloneModules,
            },
            {
              type: 'list',
              name: 'namingConvention',
              message: 'Choose naming convention:',
              choices: [
                { name: 'kebab-case (recommended)', value: 'kebab-case' },
                { name: 'camelCase', value: 'camelCase' },
                { name: 'PascalCase', value: 'PascalCase' },
                { name: 'snake_case', value: 'snake_case' },
              ],
              default: 'kebab-case',
            },
            {
              type: 'input',
              name: 'modulesPath',
              message: 'Modules directory path:',
              default: projectStructure.framework.paths.modules,
              validate: (input) => {
                if (!input || input.trim() === '') {
                  return 'Modules path is required';
                }
                return true;
              },
            },
            {
              type: 'confirm',
              name: 'createDirectories',
              message: 'Create basic directory structure now?',
              default: true,
            },
          ]);

          configOptions = {
            features: {
              standalone_modules: answers.standaloneModules,
              package_per_module: answers.packagePerModule,
            },
            conventions: {
              naming: answers.namingConvention,
            },
            paths: {
              modules: answers.modulesPath,
            },
          };

          // Create directories if requested
          if (answers.createDirectories) {
            await createBasicDirectoryStructure(
              rootDir,
              projectStructure,
              answers.modulesPath
            );
          }
        } else {
          // Use default options
          configOptions = {
            features: {
              standalone_modules: options.standalone || false,
              package_per_module: false,
            },
          };

          // Create basic structure by default
          await createBasicDirectoryStructure(
            rootDir,
            projectStructure,
            projectStructure.framework.paths.modules
          );
        }

        // Initialize configuration
        const config = await configManager.initializeConfig(
          projectStructure,
          configOptions
        );

        // Success message
        logSuccess('Modularisan initialized successfully!');
        console.log('');
        console.log(chalk.cyan('Configuration:'));
        console.log(`  Framework: ${chalk.green(config.framework.name)}`);
        console.log(
          `  TypeScript: ${chalk.green(config.features.typescript ? 'Yes' : 'No')}`
        );
        console.log(
          `  Testing: ${chalk.green(config.features.testing ? 'Yes' : 'No')}`
        );
        console.log(
          `  Standalone Modules: ${chalk.green(config.features.standalone_modules ? 'Yes' : 'No')}`
        );
        console.log(`  Modules Path: ${chalk.green(config.paths.modules)}`);
        console.log('');
        console.log(chalk.cyan('Next steps:'));
        console.log(
          `  1. Create your first module: ${chalk.green('misan create:module user-management')}`
        );
        console.log(
          `  2. Add components to modules: ${chalk.green('misan create:component login-form user-management')}`
        );
        console.log(
          `  3. List your modules: ${chalk.green('misan list modules')}`
        );
        console.log(
          `  4. Explore configuration: ${chalk.green('misan config show')}`
        );
      } catch (error) {
        logError(`Initialization failed: ${(error as Error).message}`);
        process.exit(1);
      }
    });
}

async function createBasicDirectoryStructure(
  rootDir: string,
  projectStructure: any,
  modulesPath: string
): Promise<void> {
  try {
    logInfo('Creating basic directory structure...');

    // Create modules directory
    await ensureDirectoryExists(path.join(rootDir, modulesPath));

    // Create shared directory
    await ensureDirectoryExists(
      path.join(rootDir, projectStructure.framework.paths.shared)
    );

    // Create tests directory if testing is enabled
    if (projectStructure.hasTesting) {
      await ensureDirectoryExists(
        path.join(rootDir, projectStructure.framework.paths.tests)
      );
    }

    // Create gitkeep files to ensure directories are tracked
    await fs.writeFile(path.join(rootDir, modulesPath, '.gitkeep'), '');
    await fs.writeFile(
      path.join(rootDir, projectStructure.framework.paths.shared, '.gitkeep'),
      ''
    );

    logInfo('Directory structure created successfully');
  } catch (error) {
    logError(
      `Failed to create directory structure: ${(error as Error).message}`
    );
    throw error;
  }
}
