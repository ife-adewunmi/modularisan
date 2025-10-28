import type { Command } from 'commander';
import inquirer from 'inquirer';

import { TestService } from '../services/test-service';
import { logSuccess, logError } from '../utils/logger';
import { validateName } from '../utils/validators';

export function createTestCommand(program: Command): void {
  program
    .command('create:test <name>')
    .description('Create a new test file')
    .option(
      '-p, --path <path>',
      'Path where the test file will be created',
      'src/__tests__'
    )
    .option('-t, --type <type>', 'Test type (unit, integration, e2e)', 'unit')
    .action(async (name, options) => {
      try {
        // Validate test name
        if (!validateName(name)) {
          logError(
            'Invalid test name. Use kebab-case (e.g., user-service.test)'
          );
          return;
        }

        // Ask for additional options
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'testFramework',
            message: 'Select test framework:',
            choices: ['Jest', 'Vitest', 'React Testing Library'],
            default: 'Jest',
          },
          {
            type: 'confirm',
            name: 'withMocks',
            message: 'Include mocks?',
            default: true,
          },
          {
            type: 'input',
            name: 'testTarget',
            message: 'What are you testing? (component, service, hook, etc.)',
            default: 'component',
          },
        ]);

        const testService = new TestService();

        // Create the test file
        await testService.createTest({
          name,
          path: options.path,
          type: options.type,
          testFramework: answers.testFramework,
          withMocks: answers.withMocks,
          testTarget: answers.testTarget,
        });

        logSuccess(`Test file '${name}.test.ts' created successfully!`);
      } catch (error) {
        logError(`Failed to create test file: ${(error as Error).message}`);
      }
    });
}
