import path from 'path';

import chalk from 'chalk';
import type { Command } from 'commander';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import * as yaml from 'yaml';

import { ConfigManager } from '../core/config-manager';
import { FrameworkDetector } from '../core/framework-detector';
import { logSuccess, logError, logInfo } from '../utils/logger';

export function migrateCommand(program: Command): void {
  program
    .command('migrate [source]')
    .description('Migrate from legacy tools or project structures')
    .option('-d, --directory <dir>', 'Project root directory', process.cwd())
    .option('--dry-run', 'Show what would be migrated without making changes')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (source = 'from-nextisan', options) => {
      try {
        const rootDir = path.resolve(options.directory);

        switch (source.toLowerCase()) {
          case 'from-nextisan':
          case 'nextisan':
            await migrateFromNextisan(rootDir, options);
            break;
          case 'from-create-react-app':
          case 'cra':
            await migrateFromCRA(rootDir, options);
            break;
          case 'from-angular-cli':
          case 'angular':
            await migrateFromAngular(rootDir, options);
            break;
          case 'from-vue-cli':
          case 'vue':
            await migrateFromVue(rootDir, options);
            break;
          default:
            logError(
              `Unknown migration source: ${source}. Available: from-nextisan, from-create-react-app, from-angular-cli, from-vue-cli`
            );
            break;
        }
      } catch (error) {
        logError(`Migration failed: ${(error as Error).message}`);
      }
    });
}

async function migrateFromNextisan(
  rootDir: string,
  options: any
): Promise<void> {
  logInfo('Migrating from legacy Nextisan...');

  // Check for legacy config files
  const legacyConfigs = [
    'nextisan.config.yml',
    'nextisan.config.json',
    '.nextisan.json',
  ];

  let legacyConfigPath: string | null = null;
  let legacyConfig: any = null;

  for (const configFile of legacyConfigs) {
    const configPath = path.join(rootDir, configFile);
    if (await fs.pathExists(configPath)) {
      legacyConfigPath = configPath;
      try {
        const content = await fs.readFile(configPath, 'utf8');
        legacyConfig = configFile.endsWith('.json')
          ? JSON.parse(content)
          : yaml.parse(content);
        break;
      } catch (error) {
        logError(`Failed to parse legacy config: ${configFile}`);
      }
    }
  }

  // Analyze existing project structure
  const analysis = await analyzeProjectStructure(rootDir);

  if (options.dryRun) {
    await showMigrationPlan(analysis, legacyConfig);
    return;
  }

  // Confirm migration
  if (!options.yes) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message:
          'This will modify your project structure. Continue with migration?',
        default: false,
      },
    ]);

    if (!confirm) {
      logInfo('Migration cancelled');
      return;
    }
  }

  // Perform migration
  await performNextisanMigration(rootDir, analysis, legacyConfig);

  // Clean up legacy files
  if (legacyConfigPath) {
    await fs.remove(legacyConfigPath);
    logInfo(`Removed legacy config: ${legacyConfigPath}`);
  }

  logSuccess('Migration from Nextisan completed successfully!');
  console.log('');
  console.log(chalk.cyan('Next steps:'));
  console.log(
    `  1. Review the new configuration: ${chalk.green('misan config show')}`
  );
  console.log(`  2. List your modules: ${chalk.green('misan list modules')}`);
  console.log(
    `  3. Create new modules: ${chalk.green('misan create:module <name>')}`
  );
}

async function migrateFromCRA(rootDir: string, options: any): Promise<void> {
  logInfo('Migrating from Create React App...');

  // Check for CRA structure
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error('No package.json found. Are you in a CRA project?');
  }

  const packageJson = await fs.readJson(packageJsonPath);
  if (!packageJson.dependencies?.react) {
    throw new Error('This does not appear to be a React project');
  }

  if (options.dryRun) {
    console.log(chalk.cyan('Migration Plan:'));
    console.log('  - Initialize Modularisan configuration for React');
    console.log('  - Create src/modules directory');
    console.log('  - Create src/shared directory');
    console.log('  - Move existing components to shared folder');
    return;
  }

  // Initialize Modularisan for React
  const detector = new FrameworkDetector(rootDir);
  const projectStructure = await detector.detectFramework();

  const configManager = new ConfigManager(rootDir);
  await configManager.initializeConfig(projectStructure);

  // Create basic structure
  await fs.ensureDir(path.join(rootDir, 'src/modules'));
  await fs.ensureDir(path.join(rootDir, 'src/shared'));

  logSuccess('CRA migration completed!');
}

async function migrateFromAngular(
  rootDir: string,
  options: any
): Promise<void> {
  logInfo('Migrating from Angular CLI...');

  // Check for Angular structure
  const angularJsonPath = path.join(rootDir, 'angular.json');
  if (!(await fs.pathExists(angularJsonPath))) {
    throw new Error('No angular.json found. Are you in an Angular project?');
  }

  if (options.dryRun) {
    console.log(chalk.cyan('Migration Plan:'));
    console.log('  - Initialize Modularisan configuration for Angular');
    console.log('  - Create src/app/modules directory');
    console.log('  - Analyze existing modules and components');
    return;
  }

  const detector = new FrameworkDetector(rootDir);
  const projectStructure = await detector.detectFramework();

  const configManager = new ConfigManager(rootDir);
  await configManager.initializeConfig(projectStructure);

  logSuccess('Angular migration completed!');
}

async function migrateFromVue(rootDir: string, options: any): Promise<void> {
  logInfo('Migrating from Vue CLI...');

  // Check for Vue structure
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error('No package.json found. Are you in a Vue project?');
  }

  const packageJson = await fs.readJson(packageJsonPath);
  if (!packageJson.dependencies?.vue) {
    throw new Error('This does not appear to be a Vue project');
  }

  if (options.dryRun) {
    console.log(chalk.cyan('Migration Plan:'));
    console.log('  - Initialize Modularisan configuration for Vue');
    console.log('  - Create modules directory');
    console.log('  - Organize existing components');
    return;
  }

  const detector = new FrameworkDetector(rootDir);
  const projectStructure = await detector.detectFramework();

  const configManager = new ConfigManager(rootDir);
  await configManager.initializeConfig(projectStructure);

  logSuccess('Vue migration completed!');
}

async function analyzeProjectStructure(rootDir: string): Promise<any> {
  const analysis = {
    hasLegacyFeatures: false,
    featureFolders: [] as string[],
    componentFolders: [] as string[],
    serviceFolders: [] as string[],
    recommendations: [] as string[],
  };

  // Check for src/features directory (legacy Nextisan)
  const featuresDir = path.join(rootDir, 'src/features');
  if (await fs.pathExists(featuresDir)) {
    analysis.hasLegacyFeatures = true;
    const features = await fs.readdir(featuresDir, { withFileTypes: true });
    analysis.featureFolders = features
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }

  // Check for components
  const componentsDir = path.join(rootDir, 'src/components');
  if (await fs.pathExists(componentsDir)) {
    const components = await fs.readdir(componentsDir, { withFileTypes: true });
    analysis.componentFolders = components
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }

  // Check for services
  const servicesDir = path.join(rootDir, 'src/services');
  if (await fs.pathExists(servicesDir)) {
    const services = await fs.readdir(servicesDir, { withFileTypes: true });
    analysis.serviceFolders = services
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }

  // Generate recommendations
  if (analysis.hasLegacyFeatures) {
    analysis.recommendations.push('Convert feature folders to modules');
  }
  if (analysis.componentFolders.length > 0) {
    analysis.recommendations.push('Organize components into modules');
  }
  if (analysis.serviceFolders.length > 0) {
    analysis.recommendations.push('Move services into module-specific folders');
  }

  return analysis;
}

async function showMigrationPlan(
  analysis: any,
  legacyConfig: any
): Promise<void> {
  console.log(chalk.cyan('Migration Plan:\n'));

  if (analysis.hasLegacyFeatures) {
    console.log(chalk.yellow('Legacy Features Found:'));
    analysis.featureFolders.forEach((feature: string) => {
      console.log(`  - ${chalk.green(feature)} → will become a module`);
    });
    console.log('');
  }

  if (analysis.componentFolders.length > 0) {
    console.log(chalk.yellow('Components to organize:'));
    analysis.componentFolders.forEach((component: string) => {
      console.log(`  - ${chalk.blue(component)}`);
    });
    console.log('');
  }

  if (legacyConfig) {
    console.log(chalk.yellow('Legacy Configuration:'));
    console.log(`  - Will be converted to new format`);
    console.log(`  - Legacy file will be removed`);
    console.log('');
  }

  console.log(chalk.yellow('Actions to be performed:'));
  analysis.recommendations.forEach((rec: string) => {
    console.log(`  ✓ ${chalk.green(rec)}`);
  });

  console.log('');
  console.log(chalk.gray('Run without --dry-run to perform the migration'));
}

async function performNextisanMigration(
  rootDir: string,
  analysis: any,
  legacyConfig: any
): Promise<void> {
  // Initialize new configuration
  const detector = new FrameworkDetector(rootDir);
  const projectStructure = await detector.detectFramework();

  const configManager = new ConfigManager(rootDir);

  // Merge legacy config if available
  let configOptions = {};
  if (legacyConfig) {
    configOptions = {
      features: {
        standalone_modules: legacyConfig.features?.standalone || false,
        package_per_module: legacyConfig.features?.packagePerModule || false,
      },
    };
  }

  await configManager.initializeConfig(projectStructure, configOptions);

  // Create modules directory
  const modulesDir = path.join(
    rootDir,
    projectStructure.framework.paths.modules
  );
  await fs.ensureDir(modulesDir);

  // Migrate legacy features to modules
  if (analysis.hasLegacyFeatures) {
    const featuresDir = path.join(rootDir, 'src/features');

    for (const featureName of analysis.featureFolders) {
      const oldPath = path.join(featuresDir, featureName);
      const newPath = path.join(modulesDir, featureName);

      logInfo(`Migrating feature: ${featureName}`);
      await fs.move(oldPath, newPath);
    }

    // Remove empty features directory
    try {
      await fs.rmdir(featuresDir);
    } catch (error) {
      // Directory might not be empty, that's OK
    }
  }

  // Create shared directory and move components
  const sharedDir = path.join(rootDir, projectStructure.framework.paths.shared);
  await fs.ensureDir(sharedDir);

  if (analysis.componentFolders.length > 0) {
    const componentsDir = path.join(rootDir, 'src/components');
    const sharedComponentsDir = path.join(sharedDir, 'components');

    if (await fs.pathExists(componentsDir)) {
      await fs.move(componentsDir, sharedComponentsDir);
      logInfo('Moved components to shared directory');
    }
  }
}
