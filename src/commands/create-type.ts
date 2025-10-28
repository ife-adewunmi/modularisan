import type { Command } from 'commander';
import inquirer from 'inquirer';

import { TypeService } from '../services/type-service';
import { logSuccess, logError } from '../utils/logger';
import { validateName } from '../utils/validators';

export function createTypeCommand(program: Command): void {
  program
    .command('create:type <name>')
    .description('Create a new TypeScript type definition file')
    .option(
      '-p, --path <path>',
      'Path where the type file will be created',
      'src/shared/types'
    )
    .action(async (name, options) => {
      try {
        // Validate type name
        if (!validateName(name)) {
          logError('Invalid type name. Use kebab-case (e.g., user-types)');
          return;
        }

        // Ask for additional options
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'createInterface',
            message: 'Create an interface?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'createType',
            message: 'Create a type alias?',
            default: false,
          },
          {
            type: 'confirm',
            name: 'createEnum',
            message: 'Create an enum?',
            default: false,
          },
          {
            type: 'input',
            name: 'interfaceName',
            message: 'Enter interface name:',
            default: (answers: any) => {
              // Convert kebab-case to PascalCase
              if (answers.createInterface) {
                return name
                  .split('-')
                  .map(
                    (part: any) => part.charAt(0).toUpperCase() + part.slice(1)
                  )
                  .join('');
              }
              return '';
            },
            when: (answers: any) => answers.createInterface,
          },
        ]);

        const typeService = new TypeService();

        // Create the type file
        await typeService.createType({
          name,
          path: options.path,
          createInterface: answers.createInterface,
          createType: answers.createType,
          createEnum: answers.createEnum,
          interfaceName: answers.interfaceName,
        });

        logSuccess(`Type file '${name}.ts' created successfully!`);
      } catch (error) {
        logError(`Failed to create type file: ${(error as Error).message}`);
      }
    });
}
