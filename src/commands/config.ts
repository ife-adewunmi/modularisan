import * as chalk from 'chalk';
import type { Command } from 'commander';
import inquirer from 'inquirer';

import { ConfigManager } from '@/core/config-manager';
import { logSuccess, logError, logInfo } from '@/utils/logger';
import { ConfigurationError } from '@/utils/errors';
import type { ConfigOptions } from '@/types/commands';

interface SetConfigAnswers {
  key: string;
  value: string;
}

interface EditConfigAnswers {
  confirm: boolean;
}

export function configCommand(program: Command): void {
  program
    .command('config [action]')
    .description('Manage Modularisan configuration')
    .option('-g, --global', 'Use global configuration')
    .option('--json', 'Output as JSON')
    .action(async (action: string = 'show', options: ConfigOptions) => {
      try {
        const configManager = new ConfigManager();

        switch (action.toLowerCase()) {
          case 'show':
          case 'get':
            await showConfig(configManager, options);
            break;
          case 'set':
            await setConfig(configManager, options);
            break;
          case 'edit':
            await editConfig(configManager);
            break;
          case 'reset':
            await resetConfig(configManager);
            break;
          case 'validate':
            await validateConfig(configManager);
            break;
          case 'path':
            await showConfigPath(configManager);
            break;
          default:
            logError(
              `Unknown config action: ${action}. Available actions: show, set, edit, reset, validate, path`
            );
            break;
        }
      } catch (error) {
        logError(`Config operation failed: ${(error as Error).message}`);
      }
    });

  // Add subcommands for specific config operations
  program
    .command('config:set <key> <value>')
    .description('Set a configuration value')
    .action(async (key: string, value: string) => {
      try {
        const configManager = new ConfigManager();
        await setConfigValue(configManager, key, value);
      } catch (error) {
        logError(`Failed to set config: ${(error as Error).message}`);
      }
    });

  program
    .command('config:get <key>')
    .description('Get a configuration value')
    .action(async (key: string) => {
      try {
        const configManager = new ConfigManager();
        await getConfigValue(configManager, key);
      } catch (error) {
        logError(`Failed to get config: ${(error as Error).message}`);
      }
    });
}

async function showConfig(
  configManager: ConfigManager,
  options: ConfigOptions
): Promise<void> {
  try {
    const config = await configManager.loadConfig();

    if (options.json) {
      console.log(JSON.stringify(config, null, 2));
      return;
    }

    console.log(chalk.cyan('Current Configuration:\n'));

    console.log(chalk.yellow('Project:'));
    console.log(`  Name: ${chalk.green(config.project.name)}`);
    console.log(
      `  Description: ${chalk.green(config.project.description || 'N/A')}`
    );
    console.log(`  Root Directory: ${chalk.green(config.project.rootDir)}`);
    console.log(
      `  Package Manager: ${chalk.green(config.project.packageManager)}`
    );
    console.log('');

    console.log(chalk.yellow('Framework:'));
    console.log(`  Name: ${chalk.green(config.framework.name)}`);
    console.log(`  Type: ${chalk.green(config.framework.type)}`);
    console.log(`  Version: ${chalk.green(config.framework.version || 'N/A')}`);
    console.log('');

    console.log(chalk.yellow('Paths:'));
    console.log(`  Modules: ${chalk.green(config.paths.modules)}`);
    console.log(`  Shared: ${chalk.green(config.paths.shared)}`);
    console.log(`  Tests: ${chalk.green(config.paths.tests)}`);
    console.log('');

    console.log(chalk.yellow('Features:'));
    console.log(
      `  TypeScript: ${config.features.typescript ? chalk.green('✓') : chalk.red('✗')}`
    );
    console.log(
      `  Testing: ${config.features.testing ? chalk.green('✓') : chalk.red('✗')}`
    );
    console.log(
      `  Standalone Modules: ${config.features.standalone_modules ? chalk.green('✓') : chalk.red('✗')}`
    );
    console.log(
      `  Package per Module: ${config.features.package_per_module ? chalk.green('✓') : chalk.red('✗')}`
    );
    console.log('');

    console.log(chalk.yellow('Conventions:'));
    console.log(`  Naming: ${chalk.green(config.conventions.naming)}`);
    console.log('');

    if (config.ai?.enabled) {
      console.log(chalk.yellow('AI Integration:'));
      console.log(`  Enabled: ${chalk.green('✓')}`);
      console.log(`  Provider: ${chalk.green(config.ai.provider || 'N/A')}`);
      console.log(`  Model: ${chalk.green(config.ai.model || 'N/A')}`);
      console.log('');
    }

    console.log(
      chalk.gray(`Configuration file: ${configManager.getConfigPath()}`)
    );
  } catch {
    logError(`No configuration found. Run 'misan init' to initialize.`);
  }
}

async function setConfig(
  configManager: ConfigManager,
  _options: ConfigOptions
): Promise<void> {
  const answers = await inquirer.prompt<SetConfigAnswers>([
    {
      type: 'input',
      name: 'key',
      message: 'Configuration key (e.g., features.typescript):',
      validate: (input: string) => (input ? true : 'Key is required'),
    },
    {
      type: 'input',
      name: 'value',
      message: 'Configuration value:',
      validate: (input: string) =>
        input !== undefined ? true : 'Value is required',
    },
  ]);

  await setConfigValue(configManager, answers.key, answers.value);
}

async function setConfigValue(
  configManager: ConfigManager,
  key: string,
  value: string
): Promise<void> {
  try {
    const config = await configManager.loadConfig();

    // Parse value (handle booleans, numbers, etc.)
    let parsedValue: unknown = value;
    if (value.toLowerCase() === 'true') parsedValue = true;
    else if (value.toLowerCase() === 'false') parsedValue = false;
    else if (!isNaN(Number(value))) parsedValue = Number(value);

    // Set nested property
    const keys = key.split('.');
    if (keys.length === 0) {
      throw new ConfigurationError('Invalid key path: empty key');
    }

    let current: Record<string, unknown> = config as unknown as Record<
      string,
      unknown
    >;

    for (let i = 0; i < keys.length - 1; i++) {
      const keyPart = keys[i]!;
      if (!current[keyPart]) {
        current[keyPart] = {};
      }
      current = current[keyPart] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    if (!lastKey) {
      throw new ConfigurationError('Invalid key path: undefined key segment');
    }
    current[lastKey] = parsedValue;

    await configManager.saveConfig(config);
    logSuccess(`Configuration updated: ${key} = ${String(parsedValue)}`);
  } catch (error) {
    throw new Error(`Failed to set configuration: ${(error as Error).message}`);
  }
}

async function getConfigValue(
  configManager: ConfigManager,
  key: string
): Promise<void> {
  try {
    const config = await configManager.loadConfig();

    // Get nested property
    const keys = key.split('.');
    let current: unknown = config;

    for (const k of keys) {
      if (typeof current !== 'object' || current === null || !(k in current)) {
        logError(`Configuration key '${key}' not found`);
        return;
      }
      current = (current as Record<string, unknown>)[k];
    }

    console.log(chalk.green(JSON.stringify(current, null, 2)));
  } catch (error) {
    logError(`Failed to get configuration: ${(error as Error).message}`);
  }
}

async function editConfig(configManager: ConfigManager): Promise<void> {
  try {
    const configPath = configManager.getConfigPath();
    logInfo(`Opening configuration file for editing: ${configPath}`);

    // Try to open with default editor
    const { spawn } = await import('child_process');
    const editor = process.env.EDITOR || 'nano';

    const child = spawn(editor, [configPath], {
      stdio: 'inherit',
    });

    child.on('exit', (code: number) => {
      if (code === 0) {
        logSuccess('Configuration file updated. Validating...');
        void validateConfig(configManager);
      } else {
        logError('Editor exited with non-zero code');
      }
    });
  } catch (error) {
    logError(`Failed to open editor: ${(error as Error).message}`);
    logInfo(`Please manually edit: ${configManager.getConfigPath()}`);
  }
}

async function resetConfig(configManager: ConfigManager): Promise<void> {
  const { confirm } = await inquirer.prompt<EditConfigAnswers>([
    {
      type: 'confirm',
      name: 'confirm',
      message:
        'Are you sure you want to reset the configuration? This cannot be undone.',
      default: false,
    },
  ]);

  if (!confirm) {
    logInfo('Reset cancelled');
    return;
  }

  try {
    // This would require re-running init
    logInfo(
      'To reset configuration, please delete the config file and run "misan init" again:'
    );
    console.log(chalk.yellow(`rm ${configManager.getConfigPath()}`));
    console.log(chalk.yellow('misan init'));
  } catch (error) {
    logError(`Failed to reset configuration: ${(error as Error).message}`);
  }
}

async function validateConfig(configManager: ConfigManager): Promise<void> {
  try {
    const isValid = await configManager.validateConfig();

    if (isValid) {
      logSuccess('Configuration is valid ✓');
    } else {
      logError('Configuration validation failed ✗');
      process.exit(1);
    }
  } catch (error) {
    logError(`Configuration validation failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function showConfigPath(configManager: ConfigManager): Promise<void> {
  const configPath = configManager.getConfigPath();
  console.log(configPath);

  const { pathExists } = await import('fs-extra');
  if (await pathExists(configPath)) {
    logInfo('Configuration file exists');
  } else {
    logError(
      'Configuration file does not exist. Run "misan init" to create it.'
    );
  }
}
