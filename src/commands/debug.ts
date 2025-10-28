import path from 'path';

import chalk from 'chalk';
import type { Command } from 'commander';
import * as fs from 'fs-extra';

import { ConfigManager } from '@/core/config-manager';
import { FrameworkDetector } from '@/core/framework-detector';
import { ModuleService } from '@/core/module-service';
import { logError } from '@/utils/logger';

export function debugCommand(program: Command): void {
  program
    .command('debug')
    .description('Debug Modularisan CLI setup and configuration')
    .option('-v, --verbose', 'Show verbose output')
    .option('--check-config', 'Validate configuration only')
    .option('--check-modules', 'Check modules structure')
    .action(async (options) => {
      try {
        console.log(chalk.cyan('🔍 Modularisan Debug Information\n'));

        if (options.checkConfig) {
          await debugConfiguration();
          return;
        }

        if (options.checkModules) {
          await debugModules();
          return;
        }

        // Full debug
        await debugEnvironment(options.verbose);
        await debugConfiguration();
        await debugProjectStructure(options.verbose);
        await debugTemplates(options.verbose);
        await debugModules();
      } catch (error) {
        logError(`Debug failed: ${(error as Error).message}`);
      }
    });
}

async function debugEnvironment(_verbose: boolean): Promise<void> {
  console.log(chalk.yellow('Environment:'));
  console.log(`  Node.js version: ${chalk.green(process.version)}`);
  console.log(`  Platform: ${chalk.green(process.platform)}`);
  console.log(`  Architecture: ${chalk.green(process.arch)}`);
  console.log(`  Current directory: ${chalk.green(process.cwd())}`);
  console.log(`  CLI directory: ${chalk.green(path.join(__dirname, '..'))}`);

  // Check package manager
  const packageManagers = [
    { name: 'npm', lockFile: 'package-lock.json' },
    { name: 'yarn', lockFile: 'yarn.lock' },
    { name: 'pnpm', lockFile: 'pnpm-lock.yaml' },
  ];

  for (const pm of packageManagers) {
    const lockExists = await fs.pathExists(
      path.join(process.cwd(), pm.lockFile)
    );
    if (lockExists) {
      console.log(
        `  Package manager: ${chalk.green(pm.name)} (${pm.lockFile} found)`
      );
      break;
    }
  }

  console.log('');
}

async function debugConfiguration(): Promise<void> {
  console.log(chalk.yellow('Configuration:'));

  try {
    const configManager = new ConfigManager();
    const hasConfig = await configManager.hasConfig();

    if (!hasConfig) {
      console.log(`  Status: ${chalk.red('Not initialized')}`);
      console.log(`  Config file: ${chalk.gray('Not found')}`);
      console.log(
        `  ${chalk.yellow('💡 Run "misan init" to initialize the project')}`
      );
      console.log('');
      return;
    }

    const config = await configManager.loadConfig();
    const configPath = configManager.getConfigPath();

    console.log(`  Status: ${chalk.green('Initialized')}`);
    console.log(`  Config file: ${chalk.green(configPath)}`);
    console.log(
      `  Framework: ${chalk.blue(config.framework.name)} (${config.framework.type})`
    );
    console.log(`  Version: ${chalk.green(config.version)}`);
    console.log(
      `  TypeScript: ${config.features.typescript ? chalk.green('✓') : chalk.red('✗')}`
    );
    console.log(
      `  Testing: ${config.features.testing ? chalk.green('✓') : chalk.red('✗')}`
    );
    console.log(
      `  Standalone modules: ${config.features.standalone_modules ? chalk.green('✓') : chalk.red('✗')}`
    );

    // Validate configuration
    const isValid = await configManager.validateConfig();
    console.log(`  Valid: ${isValid ? chalk.green('✓') : chalk.red('✗')}`);
  } catch (error) {
    console.log(`  Status: ${chalk.red('Error')}`);
    console.log(`  Error: ${chalk.red((error as Error).message)}`);
  }

  console.log('');
}

async function debugProjectStructure(verbose: boolean): Promise<void> {
  console.log(chalk.yellow('Project Structure:'));

  try {
    // Check basic project files
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonExists = await fs.pathExists(packageJsonPath);
    console.log(
      `  package.json: ${packageJsonExists ? chalk.green('✓') : chalk.red('✗')}`
    );

    if (packageJsonExists) {
      const packageJson = await fs.readJson(packageJsonPath);
      console.log(
        `  Project name: ${chalk.blue(packageJson.name || 'unnamed')}`
      );

      if (verbose) {
        const deps = Object.keys(packageJson.dependencies || {});
        const devDeps = Object.keys(packageJson.devDependencies || {});
        console.log(
          `  Dependencies: ${deps.length} production, ${devDeps.length} development`
        );
      }
    }

    // Detect framework
    try {
      const detector = new FrameworkDetector();
      const projectStructure = await detector.detectFramework();
      console.log(
        `  Detected framework: ${chalk.green(projectStructure.framework.name)}`
      );

      // Check framework-specific directories
      const paths = projectStructure.framework.paths;
      for (const [name, pathValue] of Object.entries(paths)) {
        if (pathValue) {
          const fullPath = path.join(process.cwd(), pathValue);
          const exists = await fs.pathExists(fullPath);
          console.log(
            `  ${name} directory: ${exists ? chalk.green('✓') : chalk.yellow('✗')} ${chalk.gray(pathValue)}`
          );
        }
      }
    } catch (error) {
      console.log(`  Framework detection: ${chalk.red('Failed')}`);
      if (verbose) {
        console.log(`    Error: ${chalk.red((error as Error).message)}`);
      }
    }
  } catch (error) {
    console.log(`  Structure check: ${chalk.red('Failed')}`);
    console.log(`  Error: ${chalk.red((error as Error).message)}`);
  }

  console.log('');
}

async function debugTemplates(verbose: boolean): Promise<void> {
  console.log(chalk.yellow('Templates:'));

  try {
    const stubsDir = path.join(__dirname, '..', 'stubs');
    const stubsExists = await fs.pathExists(stubsDir);

    console.log(
      `  Stubs directory: ${stubsExists ? chalk.green('✓') : chalk.red('✗')} ${chalk.gray(stubsDir)}`
    );

    if (stubsExists) {
      const templates = await listTemplateFiles(stubsDir);
      console.log(`  Template files: ${chalk.blue(templates.length)} found`);

      if (verbose) {
        templates.forEach((template) => {
          console.log(`    - ${chalk.green(template)}`);
        });
      }
    } else {
      console.log(
        `  ${chalk.yellow('⚠️  Templates not found. Some features may not work correctly.')}`
      );
    }
  } catch (error) {
    console.log(`  Template check: ${chalk.red('Failed')}`);
    console.log(`  Error: ${chalk.red((error as Error).message)}`);
  }

  console.log('');
}

async function debugModules(): Promise<void> {
  console.log(chalk.yellow('Modules:'));

  try {
    const configManager = new ConfigManager();
    const config = await configManager.loadConfig();
    const moduleService = new ModuleService(config);

    const modules = await moduleService.listModules();
    console.log(`  Found modules: ${chalk.blue(modules.length)}`);

    if (modules.length === 0) {
      console.log(
        `  ${chalk.yellow('💡 No modules found. Create your first module with "misan create:module <name>"')}`
      );
    } else {
      modules.forEach((module, index) => {
        console.log(`    ${index + 1}. ${chalk.green(module.name)}`);
        console.log(`       Path: ${chalk.gray(module.path)}`);
        console.log(
          `       Components: ${chalk.blue(module.components.join(', '))}`
        );
        console.log(
          `       Features: ${
            [
              module.hasRouting ? 'routing' : null,
              module.hasApi ? 'api' : null,
              module.hasTests ? 'tests' : null,
              module.isStandalone ? 'standalone' : null,
            ]
              .filter(Boolean)
              .join(', ') || 'none'
          }`
        );
      });
    }
  } catch (error) {
    console.log(`  Module check: ${chalk.red('Failed')}`);
    console.log(`  Error: ${chalk.red((error as Error).message)}`);
  }

  console.log('');
}

async function listTemplateFiles(dir: string, prefix = ''): Promise<string[]> {
  const files = await fs.readdir(dir);
  let templates: string[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      const subTemplates = await listTemplateFiles(
        filePath,
        `${prefix}${file}/`
      );
      templates = templates.concat(subTemplates);
    } else if (file.endsWith('.ejs')) {
      templates.push(`${prefix}${file}`);
    }
  }

  return templates;
}
