import type { Command } from 'commander';
import inquirer from 'inquirer';

import { ApiService } from '../services/api-service';
import { logSuccess, logError } from '../utils/logger';
import { validateName } from '../utils/validators';

export function createApiCommand(program: Command): void {
  program
    .command('create:api <name>')
    .description('Create a new API route handler')
    .option(
      '-p, --path <path>',
      'Path where the API route will be created',
      'src/app/api'
    )
    .action(async (name, options) => {
      try {
        // Validate API name
        if (!validateName(name)) {
          logError('Invalid API name. Use kebab-case (e.g., user-profile)');
          return;
        }

        // Ask for additional options
        const answers = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'methods',
            message: 'Select HTTP methods to implement:',
            choices: [
              { name: 'GET', value: 'GET', checked: true },
              { name: 'POST', value: 'POST', checked: false },
              { name: 'PUT', value: 'PUT', checked: false },
              { name: 'PATCH', value: 'PATCH', checked: false },
              { name: 'DELETE', value: 'DELETE', checked: false },
            ],
          },
          {
            type: 'confirm',
            name: 'withValidation',
            message: 'Include request validation?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'withDb',
            message: 'Include database operations?',
            default: false,
          },
          {
            type: 'confirm',
            name: 'isDynamic',
            message: 'Is this a dynamic API route?',
            default: false,
          },
          {
            type: 'input',
            name: 'dynamicParam',
            message: 'Enter dynamic parameter name:',
            default: 'id',
            when: (answers: any) => answers.isDynamic,
          },
        ]);

        const apiService = new ApiService();

        // Create the API route
        await apiService.createApi({
          name,
          path: options.path,
          methods: answers.methods,
          withValidation: answers.withValidation,
          withDb: answers.withDb,
          isDynamic: answers.isDynamic,
          dynamicParam: answers.dynamicParam,
        });

        logSuccess(`API route '${name}' created successfully!`);
      } catch (error) {
        logError(`Failed to create API route: ${(error as Error).message}`);
      }
    });
}
