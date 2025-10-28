import chalk from 'chalk';
import type { Command } from 'commander';
import inquirer from 'inquirer';

import { ConfigManager } from '@/core/config-manager';
import { ModuleService } from '@/core/module-service';
import { logSuccess, logError } from '@/utils/logger';
import { validateName } from '@/utils/validators';

export function createModuleCommand(program: Command): void {
  program
    .command('create:module [name]')
    .alias('module')
    .description('Create a new module with specified components')
    .option('-d, --description <description>', 'Module description')
    .option('-p, --path <path>', 'Custom path for the module')
    .option(
      '-t, --template <template>',
      'Module template (basic, full, api, ui)',
      'basic'
    )
    .option('--routing', 'Include routing components')
    .option('--api', 'Include API components')
    .option('--no-tests', 'Skip test files creation')
    .option('--standalone', 'Create standalone module with package.json')
    .option(
      '--components <components>',
      'Comma-separated list of components to include'
    )
    .option('-y, --yes', 'Skip interactive prompts and use defaults')
    .action(async (name, options) => {
      try {
        // Load configuration
        const configManager = new ConfigManager();
        let config;

        try {
          config = await configManager.loadConfig();
        } catch (error) {
          logError('No configuration found. Please run "misan init" first.');
          return;
        }

        // Get module name
        if (!name) {
          if (options.yes) {
            logError('Module name is required when using --yes flag');
            return;
          }

          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'What is the name of the module?',
              validate: (input) => {
                if (!input) return 'Module name is required';
                if (!validateName(input))
                  return 'Invalid module name. Use kebab-case (e.g., user-management)';
                return true;
              },
            },
          ]);
          name = answers.name;
        } else if (!validateName(name)) {
          logError(
            'Invalid module name. Use kebab-case (e.g., user-management)'
          );
          return;
        }

        // Interactive configuration if not using --yes flag
        let moduleOptions: {
          name: string;
          description?: string;
          path?: string;
          template: string;
          routing?: boolean;
          api?: boolean;
          tests: boolean;
          standalone?: boolean;
          packageJson?: boolean;
          components?: string[];
        } = {
          name,
          description: options.description,
          path: options.path,
          template: options.template,
          routing: options.routing,
          api: options.api,
          tests: options.tests !== false,
          standalone: options.standalone || config.features.standalone_modules,
          packageJson: config.features.package_per_module,
        };

        if (!options.yes) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Module description (optional):',
              default: options.description || '',
              when: () => !options.description,
            },
            {
              type: 'list',
              name: 'template',
              message: 'Choose module template:',
              choices: [
                { name: 'Basic (components, services, types)', value: 'basic' },
                {
                  name: 'Full (components, services, types, hooks, utils, tests)',
                  value: 'full',
                },
                {
                  name: 'API (services, types, controllers, middleware)',
                  value: 'api',
                },
                { name: 'UI (components, hooks, types, styles)', value: 'ui' },
              ],
              default: options.template,
            },
            {
              type: 'checkbox',
              name: 'features',
              message: 'Select additional features:',
              choices: [
                {
                  name: 'Routing components',
                  value: 'routing',
                  checked: options.routing,
                  disabled: config.framework.type === 'backend',
                },
                {
                  name: 'API endpoints',
                  value: 'api',
                  checked: options.api,
                  disabled: !config.framework.features?.api,
                },
                {
                  name: 'Test files',
                  value: 'tests',
                  checked: options.tests !== false,
                },
                {
                  name: 'Standalone module (with package.json)',
                  value: 'standalone',
                  checked: moduleOptions.standalone,
                },
              ],
            },
            {
              type: 'input',
              name: 'customComponents',
              message: 'Custom components (comma-separated, optional):',
              when: () => !options.components,
              filter: (input) =>
                input
                  ? input
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                  : [],
            },
          ]);

          moduleOptions = {
            ...moduleOptions,
            description: answers.description || moduleOptions.description,
            template: answers.template,
            routing: answers.features.includes('routing'),
            api: answers.features.includes('api'),
            tests: answers.features.includes('tests'),
            standalone: answers.features.includes('standalone'),
            components: options.components
              ? options.components.split(',').map((s: string) => s.trim())
              : answers.customComponents,
          };
        }

        // Create module
        const moduleService = new ModuleService(config);
        const moduleStructure = await moduleService.createModule(moduleOptions);

        // Success message
        logSuccess(`Module '${name}' created successfully!`);
        console.log('');
        console.log(chalk.cyan('Module Details:'));
        console.log(`  Name: ${chalk.green(moduleStructure.name)}`);
        console.log(`  Path: ${chalk.green(moduleStructure.path)}`);
        console.log(
          `  Components: ${chalk.green(moduleStructure.components.join(', '))}`
        );
        console.log(
          `  Routing: ${chalk.green(moduleStructure.hasRouting ? 'Yes' : 'No')}`
        );
        console.log(
          `  API: ${chalk.green(moduleStructure.hasApi ? 'Yes' : 'No')}`
        );
        console.log(
          `  Tests: ${chalk.green(moduleStructure.hasTests ? 'Yes' : 'No')}`
        );
        console.log(
          `  Standalone: ${chalk.green(moduleStructure.isStandalone ? 'Yes' : 'No')}`
        );
        console.log('');
        console.log(chalk.cyan('Next steps:'));
        console.log(
          `  1. Add components: ${chalk.green(`misan create:component login-form ${name}`)}`
        );
        console.log(
          `  2. Add services: ${chalk.green(`misan create:service user-service ${name}`)}`
        );
        console.log(
          `  3. View module: ${chalk.green(`ls ${moduleStructure.path}`)}`
        );
      } catch (error) {
        logError(`Failed to create module: ${(error as Error).message}`);
      }
    });
}
