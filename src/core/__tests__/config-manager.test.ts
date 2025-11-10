import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import * as path from 'path';
import { ConfigManager } from '../config-manager';
import type { ProjectStructure } from '../framework-detector';

describe('ConfigManager', () => {
  const testDir = path.join(__dirname, 'test-fixtures-config');
  let configManager: ConfigManager;

  beforeEach(async () => {
    // Clean up and create test directory
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    configManager = new ConfigManager(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDir);
  });

  describe('initializeConfig', () => {
    it('should create a valid config file', async () => {
      const projectStructure: ProjectStructure = {
        framework: {
          name: 'React',
          type: 'frontend',
          version: '18.0.0',
          paths: {
            modules: 'src/modules',
            shared: 'src/shared',
            tests: 'src/__tests__',
            src: '',
            components: ''
          },
          extensions: {
            component: '.tsx',
            service: '.ts',
            test: '.test.ts',
            page: '',
            api: ''
          },
          features: {
            routing: false,
            api: false,
            ssr: false,
            typescript: false,
            testing: false
          },
        },
        hasTypeScript: true,
        hasTesting: true,
        packageManager: 'npm',
        rootDir: ''
      };

      const config = await configManager.initializeConfig(projectStructure);

      expect(config).toBeDefined();
      expect(config.version).toBe('2.0.0');
      expect(config.framework.name).toBe('React');
      expect(config.framework.type).toBe('frontend');
      expect(config.features.typescript).toBe(true);
      expect(config.features.testing).toBe(true);
    });

    it('should read project name from package.json if exists', async () => {
      const packageJsonPath = path.join(testDir, 'package.json');
      await fs.writeJson(packageJsonPath, {
        name: 'my-awesome-project',
        description: 'An awesome project',
      });

      const projectStructure: ProjectStructure = {
        framework: {
          name: 'React',
          type: 'frontend',
          paths: {
            modules: 'src/modules',
            shared: 'src/shared',
            tests: 'src/__tests__',
            src: '',
            components: ''
          },
          extensions: {
            component: '.tsx',
            service: '.ts',
            test: '.test.ts',
            page: '',
            api: ''
          },
          features: {
            routing: false,
            api: false,
            ssr: false,
            typescript: false,
            testing: false
          },
        },
        hasTypeScript: true,
        hasTesting: true,
        packageManager: 'npm',
        rootDir: ''
      };

      const config = await configManager.initializeConfig(projectStructure);

      expect(config.project.name).toBe('my-awesome-project');
      expect(config.project.description).toBe('An awesome project');
    });

    it('should save config file to disk', async () => {
      const projectStructure: ProjectStructure = {
        framework: {
          name: 'Next.js',
          type: 'fullstack',
          paths: {
            modules: 'src/modules',
            shared: 'src/shared',
            tests: '__tests__',
            src: '',
            components: ''
          },
          extensions: {
            component: '.tsx',
            service: '.ts',
            test: '.test.tsx',
            page: '',
            api: ''
          },
          features: {
            routing: true,
            api: true,
            ssr: true,
            typescript: false,
            testing: false
          },
        },
        hasTypeScript: true,
        hasTesting: true,
        packageManager: 'npm',
        rootDir: ''
      };

      await configManager.initializeConfig(projectStructure);

      const configPath = path.join(testDir, 'modularisan.config.yml');
      const exists = await fs.pathExists(configPath);
      expect(exists).toBe(true);
    });
  });

  describe('loadConfig', () => {
    it('should load existing config file', async () => {
      const configPath = path.join(testDir, 'modularisan.config.yml');
      const mockConfig = `
version: "2.0.0"
framework:
  name: "React"
  type: "frontend"
  features: {}
project:
  name: "test-project"
  rootDir: "${testDir}"
  packageManager: "npm"
paths:
  modules: "src/modules"
  shared: "src/shared"
  tests: "src/__tests__"
features:
  typescript: true
  testing: true
  standalone_modules: false
  package_per_module: false
templates:
  component: "default"
  service: "default"
  test: "default"
  module: "default"
conventions:
  naming: "kebab-case"
  file_extensions: {}
`;
      await fs.writeFile(configPath, mockConfig);

      const config = await configManager.loadConfig();

      expect(config).toBeDefined();
      expect(config.version).toBe('2.0.0');
      expect(config.framework.name).toBe('React');
      expect(config.project.name).toBe('test-project');
    });

    it('should throw error for invalid YAML', async () => {
      const configPath = path.join(testDir, 'modularisan.config.yml');
      await fs.writeFile(configPath, 'invalid: yaml: content: [[[');

      await expect(configManager.loadConfig()).rejects.toThrow(
        'Invalid configuration file'
      );
    });

    it('should cache loaded config', async () => {
      const configPath = path.join(testDir, 'modularisan.config.yml');
      const mockConfig = `
version: "2.0.0"
framework:
  name: "React"
  type: "frontend"
  features: {}
project:
  name: "test-project"
  rootDir: "${testDir}"
  packageManager: "npm"
paths:
  modules: "src/modules"
  shared: "src/shared"
  tests: "src/__tests__"
features:
  typescript: true
  testing: true
  standalone_modules: false
  package_per_module: false
templates:
  component: "default"
  service: "default"
  test: "default"
  module: "default"
conventions:
  naming: "kebab-case"
  file_extensions: {}
`;
      await fs.writeFile(configPath, mockConfig);

      const config1 = await configManager.loadConfig();
      const config2 = await configManager.loadConfig();

      expect(config1).toBe(config2); // Should return the same object reference
    });
  });

  describe('saveConfig', () => {
    it('should save config to YAML file', async () => {
      const mockConfig = {
        version: '2.0.0',
        framework: {
          name: 'React',
          type: 'frontend' as const,
          features: {},
        },
        project: {
          name: 'test-project',
          rootDir: testDir,
          packageManager: 'npm' as const,
        },
        paths: {
          modules: 'src/modules',
          shared: 'src/shared',
          tests: 'src/__tests__',
        },
        features: {
          typescript: true,
          testing: true,
          standalone_modules: false,
          package_per_module: false,
        },
        templates: {
          component: 'default',
          service: 'default',
          test: 'default',
          module: 'default',
        },
        conventions: {
          naming: 'kebab-case' as const,
          file_extensions: {},
        },
      };

      await configManager.saveConfig(mockConfig);

      const configPath = path.join(testDir, 'modularisan.config.yml');
      const exists = await fs.pathExists(configPath);
      expect(exists).toBe(true);

      const content = await fs.readFile(configPath, 'utf8');
      expect(content).toContain('version: 2.0.0');
      expect(content).toContain('name: React');
    });
  });

  describe('getConfigPath', () => {
    it('should return the config file path', () => {
      const configPath = configManager.getConfigPath();

      expect(configPath).toBeDefined();
      expect(configPath).toContain('modularisan.config.yml');
    });

    it('should detect existing config file names', async () => {
      const altConfigPath = path.join(testDir, 'misan.config.yml');
      await fs.writeFile(altConfigPath, 'version: "2.0.0"');

      // Create new instance to detect the file
      const newConfigManager = new ConfigManager(testDir);
      const configPath = newConfigManager.getConfigPath();

      expect(configPath).toContain('misan.config.yml');
    });
  });

  describe('config validation', () => {
    it('should have default values for optional fields', async () => {
      const projectStructure: ProjectStructure = {
        framework: {
          name: 'Vue.js',
          type: 'frontend',
          paths: {
            modules: 'src/modules',
            shared: 'src/shared',
            tests: 'tests',
            src: '',
            components: ''
          },
          extensions: {
            component: '.vue',
            service: '.ts',
            test: '.spec.ts',
            page: '',
            api: ''
          },
          features: {
            routing: false,
            api: false,
            ssr: false,
            typescript: false,
            testing: false
          },
        },
        hasTypeScript: false,
        hasTesting: false,
        packageManager: 'npm',
        rootDir: ''
      };

      const config = await configManager.initializeConfig(projectStructure);

      expect(config.conventions.naming).toBe('kebab-case');
      expect(config.features.standalone_modules).toBe(false);
      expect(config.features.package_per_module).toBe(false);
      expect(config.ai?.enabled).toBe(false);
    });
  });
});
