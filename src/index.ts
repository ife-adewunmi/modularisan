import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import figlet from 'figlet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = fs.readJsonSync(packageJsonPath);

import { aiAnalyzeCommand } from './commands/ai-analyze';
import { aiArchitectCommand } from './commands/ai-architect';
import { aiDocsCommand } from './commands/ai-docs';
import { configCommand } from './commands/config';
import { createApiCommand } from './commands/create-api';
import { createComponentCommand } from './commands/create-component';
import { createFeatureCommand } from './commands/create-feature';
import { createHookCommand } from './commands/create-hook';
import { createModuleCommand } from './commands/create-module';
import { createPageCommand } from './commands/create-page';
import { createServiceCommand } from './commands/create-service';
import { createTestCommand } from './commands/create-test';
import { createTypeCommand } from './commands/create-type';
import { debugCommand } from './commands/debug';
import { generateCommand } from './commands/generate';
import { initCommand } from './commands/init';
import { listCommand } from './commands/list';
import { migrateCommand } from './commands/migrate';

// Display banner
console.log(
  chalk.cyan(figlet.textSync('Modularisan', { horizontalLayout: 'full' }))
);
console.log(chalk.cyan('Framework-agnostic modular code generator\n'));

const program = new Command();

program
  .version(packageJson.version)
  .description(
    'A framework-agnostic CLI tool for generating modular, scalable code structures'
  );

// Register commands
initCommand(program);
createModuleCommand(program);
createComponentCommand(program);
createServiceCommand(program);
listCommand(program);
generateCommand(program);
configCommand(program);
migrateCommand(program);
createApiCommand(program);
createTypeCommand(program);
createFeatureCommand(program);
createTestCommand(program);
createHookCommand(program);
createPageCommand(program);
aiAnalyzeCommand(program);
aiDocsCommand(program);
aiArchitectCommand(program);
debugCommand(program);

// Add help text
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log(
    '  $ misan init                                    # Initialize project configuration'
  );
  console.log(
    '  $ misan create:module user-management           # Create a new module'
  );
  console.log(
    '  $ misan create:component login-form user        # Create component in user module'
  );
  console.log(
    '  $ misan create:service user-service user        # Create service in user module'
  );
  console.log(
    '  $ misan list modules                           # List all modules'
  );
  console.log(
    '  $ misan generate component --ai                # AI-assisted component generation'
  );
  console.log(
    '  $ misan ai:analyze src/components/Button.tsx   # Analyze code with AI'
  );
  console.log(
    '  $ misan ai:docs src/services/api.ts            # Generate documentation with AI'
  );
  console.log(
    '  $ misan ai:architect "E-commerce platform"     # Get architecture suggestions'
  );
  console.log(
    '  $ misan config set features.standalone true    # Update configuration'
  );
  console.log(
    '  $ misan migrate from-nextisan                  # Migrate from legacy Nextisan'
  );
  console.log(
    '  $ misan debug                                  # Debug project setup'
  );
  console.log('');
  console.log('Supported Frameworks:');
  console.log('  Frontend: React, Vue.js, Svelte, Angular');
  console.log('  Backend: Nest.js, Express.js');
  console.log('  Fullstack: Next.js, Nuxt.js');
  console.log('');
  console.log(
    'For more information, visit: https://github.com/ife-adewunmi/modularisan'
  );
});

program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
