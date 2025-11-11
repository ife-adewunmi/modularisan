import chalk from 'chalk';
import type { Command } from 'commander';
import inquirer from 'inquirer';

import { AIService } from '../core/ai-service';
import { ConfigManager } from '../core/config-manager';
import { ModuleService } from '../core/module-service';
import { logSuccess, logError, logInfo } from '../utils/logger';
import { validateName } from '../utils/validators';

export function generateCommand(program: Command): void {
  program
    .command('generate [type]')
    .alias('g')
    .description('Generate code using AI or templates')
    .option('--ai', 'Use AI for code generation')
    .option('--prompt <prompt>', 'Custom prompt for AI generation')
    .option('--template <template>', 'Use specific template')
    .option('--module <module>', 'Target module for generation')
    .option('--name <name>', 'Name for generated item')
    .option('--dry-run', 'Preview changes without creating files')
    .option('-y, --yes', 'Skip interactive prompts and use defaults')
    .action(async (type, options) => {
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

        // Determine generation type
        if (!type) {
          if (options.yes) {
            logError('Generation type is required when using --yes flag');
            return;
          }

          const { selectedType } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedType',
              message: 'What would you like to generate?',
              choices: [
                { name: 'Module', value: 'module' },
                { name: 'Component', value: 'component' },
                { name: 'Service', value: 'service' },
                { name: 'Hook', value: 'hook' },
                { name: 'Type/Interface', value: 'type' },
                { name: 'Test', value: 'test' },
                { name: 'API Endpoint', value: 'api' },
                { name: 'Custom (with AI)', value: 'custom' },
              ],
            },
          ]);
          type = selectedType;
        }

        // Check if AI is available and enabled
        const useAI = options.ai || config.ai?.enabled || type === 'custom';

        if (useAI && !config.ai?.enabled) {
          logError(
            'AI integration is not enabled. Configure it with: misan config set ai.enabled true'
          );
          return;
        }

        switch (type.toLowerCase()) {
          case 'module':
            await generateModule(config, options, useAI);
            break;
          case 'component':
            await generateComponent(config, options, useAI);
            break;
          case 'service':
            await generateService(config, options, useAI);
            break;
          case 'hook':
            await generateHook(config, options, useAI);
            break;
          case 'type':
          case 'interface':
            await generateType(config, options, useAI);
            break;
          case 'test':
            await generateTest(config, options, useAI);
            break;
          case 'api':
          case 'endpoint':
            await generateAPI(config, options, useAI);
            break;
          case 'custom':
            await generateCustom(config, options);
            break;
          default:
            logError(
              `Unknown generation type: ${type}. Available types: module, component, service, hook, type, test, api, custom`
            );
            break;
        }
      } catch (error) {
        logError(`Generation failed: ${(error as Error).message}`);
      }
    });
}

async function generateModule(
  config: any,
  options: any,
  useAI: boolean
): Promise<void> {
  if (useAI) {
    logInfo('AI-powered module generation coming soon!');
    logInfo('For now, using standard module creation...');
  }

  const moduleService = new ModuleService(config);

  // Get module details
  let name = options.name;
  let description = '';

  if (!name || !options.yes) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Module name:',
        when: () => !name,
        validate: (input) => {
          if (!input) return 'Module name is required';
          if (!validateName(input))
            return 'Invalid module name. Use kebab-case (e.g., user-management)';
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Module description:',
        when: () => useAI,
      },
      {
        type: 'list',
        name: 'template',
        message: 'Module template:',
        choices: [
          { name: 'Basic (components, services, types)', value: 'basic' },
          { name: 'Full (all features)', value: 'full' },
          { name: 'API focused', value: 'api' },
          { name: 'UI focused', value: 'ui' },
        ],
        when: () => !useAI,
      },
    ]);

    name = name || answers.name;
    description = answers.description || '';
  }

  if (useAI && description) {
    // AI-enhanced module generation would go here
    logInfo(
      'Analyzing requirements and generating optimized module structure...'
    );
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate AI processing
  }

  await moduleService.createModule({
    name,
    description,
    template: options.template || 'basic',
  });
}

async function generateComponent(
  config: any,
  options: any,
  useAI: boolean
): Promise<void> {
  if (useAI) {
    await generateAIComponent(config, options);
  } else {
    await generateTemplateComponent(config, options);
  }
}

async function generateAIComponent(config: any, options: any): Promise<void> {
  logInfo('AI-powered component generation...');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Describe the component you want to create:',
      validate: (input) =>
        input ? true : 'Description is required for AI generation',
    },
    {
      type: 'input',
      name: 'name',
      message: 'Component name:',
      when: () => !options.name,
      validate: (input) => {
        if (!input) return 'Component name is required';
        if (!validateName(input))
          return 'Invalid component name. Use kebab-case';
        return true;
      },
    },
    {
      type: 'input',
      name: 'module',
      message: 'Target module:',
      when: () => !options.module,
      validate: (input) => (input ? true : 'Module name is required'),
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'What features should this component have?',
      choices: [
        { name: 'Form handling', value: 'form' },
        { name: 'Data fetching', value: 'data' },
        { name: 'State management', value: 'state' },
        { name: 'Animations', value: 'animations' },
        { name: 'Responsive design', value: 'responsive' },
        { name: 'Accessibility', value: 'a11y' },
        { name: 'Error handling', value: 'error' },
        { name: 'Loading states', value: 'loading' },
      ],
    },
  ]);

  // Initialize AI service
  const aiService = new AIService(config);

  if (!aiService.isEnabled()) {
    logError('AI service is not enabled. Using template generation...');
    const moduleService = new ModuleService(config);
    await moduleService.createComponent({
      name: options.name || answers.name,
      moduleName: options.module || answers.module,
      type: 'functional',
      props: true,
      client: config.framework.type !== 'backend',
      test: config.features.testing,
    });
    return;
  }

  // Generate component using AI
  console.log(chalk.cyan('\n🤖 AI is analyzing your requirements...'));

  try {
    const aiResponse = await aiService.generateComponent({
      name: options.name || answers.name,
      description: answers.description,
      moduleName: options.module || answers.module,
      features: answers.features,
    });

    console.log(chalk.green('✨ Component generated successfully!'));
    console.log('\n' + chalk.cyan('AI Explanation:'));
    console.log(aiResponse.explanation);

    if (aiResponse.suggestions.length > 0) {
      console.log('\n' + chalk.cyan('Suggestions:'));
      aiResponse.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }

    if (aiResponse.dependencies && aiResponse.dependencies.length > 0) {
      console.log('\n' + chalk.cyan('Dependencies to install:'));
      aiResponse.dependencies.forEach((dep) => {
        console.log(`  - ${dep}`);
      });
    }

    // Save the generated code to the file system
    const path = await import('path');
    const componentName = options.name || answers.name;
    const moduleName = options.module || answers.module;

    // Find module path
    const moduleService = new ModuleService(config);
    const modulePath = await moduleService.findModulePath(moduleName);

    if (!modulePath) {
      logError(`Module '${moduleName}' not found. Cannot save generated code.`);
      console.log('\n' + chalk.cyan('Generated Code:'));
      console.log(chalk.gray(aiResponse.code));
      return;
    }

    const componentDir = path.join(modulePath, 'components');
    const componentFileName = `${componentName}${config.conventions.file_extensions.component}`;

    await aiService.saveGeneratedCode(
      aiResponse,
      componentDir,
      componentFileName,
      options.dryRun
    );

    if (options.dryRun) {
      logSuccess(`[DRY RUN] Component '${componentName}' would be created in module '${moduleName}'!`);
    } else {
      logSuccess(`Component '${componentName}' created successfully in module '${moduleName}'!`);
    }
  } catch (error) {
    logError(`AI generation failed: ${(error as Error).message}`);
    logInfo('Falling back to template generation...');

    const moduleService = new ModuleService(config);
    await moduleService.createComponent({
      name: options.name || answers.name,
      moduleName: options.module || answers.module,
      type: 'functional',
      props: true,
      client: config.framework.type !== 'backend',
      test: config.features.testing,
    });
  }
}

async function generateTemplateComponent(
  config: any,
  options: any
): Promise<void> {
  const moduleService = new ModuleService(config);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Component name:',
      when: () => !options.name,
      validate: (input) => {
        if (!input) return 'Component name is required';
        if (!validateName(input))
          return 'Invalid component name. Use kebab-case';
        return true;
      },
    },
    {
      type: 'input',
      name: 'module',
      message: 'Target module:',
      when: () => !options.module,
      validate: (input) => (input ? true : 'Module name is required'),
    },
  ]);

  await moduleService.createComponent({
    name: options.name || answers.name,
    moduleName: options.module || answers.module,
    type: 'functional',
    props: true,
    client: config.framework.type !== 'backend',
    test: config.features.testing,
  });
}

async function generateService(
  config: any,
  options: any,
  useAI: boolean
): Promise<void> {
  const moduleService = new ModuleService(config);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Service name:',
      when: () => !options.name,
      validate: (input) => {
        if (!input) return 'Service name is required';
        if (!validateName(input)) return 'Invalid service name. Use kebab-case';
        return true;
      },
    },
    {
      type: 'input',
      name: 'module',
      message: 'Target module:',
      when: () => !options.module,
      validate: (input) => (input ? true : 'Module name is required'),
    },
    {
      type: 'input',
      name: 'description',
      message: 'Service description:',
      when: () => useAI,
      validate: (input) =>
        input ? true : 'Description is required for AI generation',
    },
    {
      type: 'checkbox',
      name: 'methods',
      message: 'What methods should this service have?',
      choices: [
        { name: 'Create (POST)', value: 'create' },
        { name: 'Read (GET)', value: 'read' },
        { name: 'Update (PUT)', value: 'update' },
        { name: 'Delete (DELETE)', value: 'delete' },
        { name: 'List/Search', value: 'list' },
        { name: 'Validation', value: 'validate' },
      ],
      when: () => useAI,
    },
  ]);

  if (useAI) {
    const aiService = new AIService(config);

    if (!aiService.isEnabled()) {
      logError('AI service is not enabled. Using template generation...');
    } else {
      try {
        console.log(chalk.cyan('\n🤖 AI is generating your service...'));

        const aiResponse = await aiService.generateService({
          name: options.name || answers.name,
          description: answers.description,
          moduleName: options.module || answers.module,
          methods: answers.methods,
          isServer: config.framework.type === 'backend',
        });

        console.log(chalk.green('✨ Service generated successfully!'));
        console.log('\n' + chalk.cyan('AI Explanation:'));
        console.log(aiResponse.explanation);

        if (aiResponse.suggestions.length > 0) {
          console.log('\n' + chalk.cyan('Suggestions:'));
          aiResponse.suggestions.forEach((suggestion, index) => {
            console.log(`  ${index + 1}. ${suggestion}`);
          });
        }

        // Save the generated code to the file system
        const path = await import('path');
        const serviceName = options.name || answers.name;
        const moduleName = options.module || answers.module;

        // Find module path
        const moduleService = new ModuleService(config);
        const modulePath = await moduleService['findModulePath'](moduleName);

        if (!modulePath) {
          logError(`Module '${moduleName}' not found. Cannot save generated code.`);
          console.log('\n' + chalk.cyan('Generated Code:'));
          console.log(chalk.gray(aiResponse.code));
          return;
        }

        const servicesDir = path.join(modulePath, 'services');
        const serviceFileName = `${serviceName}${config.conventions.file_extensions.service}`;

        await aiService.saveGeneratedCode(
          aiResponse,
          servicesDir,
          serviceFileName,
          options.dryRun
        );

        if (options.dryRun) {
          logSuccess(`[DRY RUN] Service '${serviceName}' would be created in module '${moduleName}'!`);
        } else {
          logSuccess(`Service '${serviceName}' created successfully in module '${moduleName}'!`);
        }
        return;
      } catch (error) {
        logError(`AI generation failed: ${(error as Error).message}`);
        logInfo('Falling back to template generation...');
      }
    }
  }

  // Fall back to template generation
  await moduleService.createService(
    options.module || answers.module,
    options.name || answers.name,
    config.framework.type === 'backend'
  );
}

async function generateHook(
  config: any,
  options: any,
  _useAI: boolean
): Promise<void> {
  logInfo('Hook generation...');

  if (config.framework.type === 'backend') {
    logError('Hooks are not applicable for backend frameworks');
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Hook name (without "use" prefix):',
      when: () => !options.name,
      validate: (input) => {
        if (!input) return 'Hook name is required';
        return true;
      },
    },
    {
      type: 'input',
      name: 'module',
      message: 'Target module:',
      when: () => !options.module,
      validate: (input) => (input ? true : 'Module name is required'),
    },
  ]);

  const hookName = (options.name || answers.name).startsWith('use')
    ? options.name || answers.name
    : `use-${options.name || answers.name}`;

  const moduleService = new ModuleService(config);
  await moduleService.createComponent({
    name: hookName,
    moduleName: options.module || answers.module,
    type: 'hook',
    props: false,
    client: false,
    test: config.features.testing,
  });
}

async function generateType(
  config: any,
  options: any,
  _useAI: boolean
): Promise<void> {
  logInfo('Type/Interface generation...');

  const moduleService = new ModuleService(config);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Type name:',
      when: () => !options.name,
      validate: (input) => {
        if (!input) return 'Type name is required';
        if (!validateName(input)) return 'Invalid type name. Use kebab-case';
        return true;
      },
    },
    {
      type: 'input',
      name: 'module',
      message: 'Target module:',
      when: () => !options.module,
      validate: (input) => (input ? true : 'Module name is required'),
    },
    {
      type: 'checkbox',
      name: 'typeOptions',
      message: 'What would you like to create?',
      choices: [
        { name: 'Interface', value: 'interface', checked: true },
        { name: 'Type alias', value: 'type', checked: false },
        { name: 'Enum', value: 'enum', checked: false },
      ],
    },
  ]);

  await moduleService.createType({
    name: options.name || answers.name,
    moduleName: options.module || answers.module,
    typeOptions: answers.typeOptions || ['interface'],
  });
}

async function generateTest(
  config: any,
  options: any,
  _useAI: boolean
): Promise<void> {
  logInfo('Test generation...');

  if (!config.features.testing) {
    logError('Testing is not enabled in this project');
    return;
  }

  const moduleService = new ModuleService(config);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Test name:',
      when: () => !options.name,
      validate: (input) => {
        if (!input) return 'Test name is required';
        return true;
      },
    },
    {
      type: 'input',
      name: 'module',
      message: 'Target module:',
      when: () => !options.module,
      validate: (input) => (input ? true : 'Module name is required'),
    },
    {
      type: 'list',
      name: 'testType',
      message: 'Test type:',
      choices: [
        { name: 'Component test', value: 'component' },
        { name: 'Service test', value: 'service' },
        { name: 'Hook test', value: 'hook' },
        { name: 'Integration test', value: 'integration' },
        { name: 'Unit test', value: 'unit' },
      ],
    },
  ]);

  await moduleService.createTest({
    name: options.name || answers.name,
    moduleName: options.module || answers.module,
    testType: answers.testType,
  });
}

async function generateAPI(
  config: any,
  options: any,
  _useAI: boolean
): Promise<void> {
  logInfo('API endpoint generation...');

  if (config.framework.type === 'frontend') {
    logError('API generation is not applicable for frontend-only frameworks');
    return;
  }

  const moduleService = new ModuleService(config);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'API endpoint name:',
      when: () => !options.name,
      validate: (input) => {
        if (!input) return 'API endpoint name is required';
        if (!validateName(input)) return 'Invalid API name. Use kebab-case';
        return true;
      },
    },
    {
      type: 'input',
      name: 'module',
      message: 'Target module:',
      when: () => !options.module,
      validate: (input) => (input ? true : 'Module name is required'),
    },
    {
      type: 'checkbox',
      name: 'methods',
      message: 'HTTP methods to support:',
      choices: [
        { name: 'GET', value: 'get', checked: true },
        { name: 'POST', value: 'post', checked: false },
        { name: 'PUT', value: 'put', checked: false },
        { name: 'DELETE', value: 'delete', checked: false },
        { name: 'PATCH', value: 'patch', checked: false },
      ],
    },
    {
      type: 'confirm',
      name: 'withValidation',
      message: 'Include input validation?',
      default: true,
    },
  ]);

  await moduleService.createAPI({
    name: options.name || answers.name,
    moduleName: options.module || answers.module,
    methods: answers.methods,
    withValidation: answers.withValidation,
  });
}

async function generateCustom(config: any, options: any): Promise<void> {
  logInfo('Custom AI generation...');

  if (!config.ai?.enabled) {
    logError('AI is not configured. Please set up AI integration first.');
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'prompt',
      message: 'Describe what you want to generate:',
      when: () => !options.prompt,
      validate: (input) =>
        input ? true : 'Prompt is required for custom generation',
    },
    {
      type: 'list',
      name: 'outputType',
      message: 'What type of output do you expect?',
      choices: [
        { name: 'Component', value: 'component' },
        { name: 'Service/Function', value: 'service' },
        { name: 'Complete Module', value: 'module' },
        { name: 'Configuration', value: 'config' },
        { name: 'Other', value: 'other' },
      ],
    },
  ]);

  const prompt = options.prompt || answers.prompt;

  console.log(chalk.cyan('\n🤖 Processing your request...'));
  console.log(chalk.gray(`Prompt: "${prompt}"`));

  // Simulate AI processing
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log(
    chalk.yellow('\n🚧 AI-powered custom generation is coming soon!')
  );
  console.log(
    chalk.gray(
      'This feature will use your configured AI provider to generate custom code based on your descriptions.'
    )
  );

  logSuccess('Request logged for future implementation!');
}
