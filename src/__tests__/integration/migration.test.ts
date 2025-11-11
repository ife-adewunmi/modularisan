import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach } from 'vitest';

import { ModuleService } from '../../core/module-service';
import type { ModularisanConfig } from '../../core/config-manager';

describe('Integration — Module deletion (migration-like)', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mig-test-'));
  });

  it('removes a previously created module directory', async () => {
    const config: ModularisanConfig = {
      version: 'test',
      framework: {
        name: 'TestFramework',
        type: 'frontend',
        features: {},
      },
      project: {
        name: 'modularisan-integration-test',
        rootDir: tmpDir,
        packageManager: 'npm',
      },
      paths: {
        modules: 'modules',
        shared: 'shared',
        tests: '__tests__',
      },
      features: {
        typescript: true,
        testing: false,
        standalone_modules: false,
        package_per_module: false,
      },
      templates: {
        component: 'test/component',
        service: 'test/service',
        test: 'test/test',
        module: 'test/module',
      },
      conventions: {
        naming: 'kebab-case',
        file_extensions: {
          component: '.tsx',
          service: '.ts',
          test: '.test.ts',
        },
      },
    } as unknown as ModularisanConfig;

    const moduleService = new ModuleService(config);

    // Manually create a module directory to test deletion
    const moduleName = 'temp-module';
    const modulePath = path.join(tmpDir, config.paths.modules, moduleName);
    await fs.ensureDir(modulePath);
    await fs.writeFile(path.join(modulePath, 'README.md'), '# Temp Module');

    expect(await fs.pathExists(modulePath)).toBe(true);

    // Delete the module
    await moduleService.deleteModule(moduleName, true);

    // Verify it's deleted
    expect(await fs.pathExists(modulePath)).toBe(false);

    await fs.remove(tmpDir);
  });

  it('prevents module deletion when module does not exist', async () => {
    const config: ModularisanConfig = {
      version: 'test',
      framework: {
        name: 'TestFramework',
        type: 'frontend',
        features: {},
      },
      project: {
        name: 'modularisan-integration-test',
        rootDir: tmpDir,
        packageManager: 'npm',
      },
      paths: {
        modules: 'modules',
        shared: 'shared',
        tests: '__tests__',
      },
      features: {
        typescript: true,
        testing: false,
        standalone_modules: false,
        package_per_module: false,
      },
      templates: {
        component: 'test/component',
        service: 'test/service',
        test: 'test/test',
        module: 'test/module',
      },
      conventions: {
        naming: 'kebab-case',
        file_extensions: {
          component: '.tsx',
          service: '.ts',
          test: '.test.ts',
        },
      },
    } as unknown as ModularisanConfig;

    const moduleService = new ModuleService(config);

    // Try to delete non-existent module
    await expect(
      moduleService.deleteModule('non-existent-module', true)
    ).rejects.toThrow('not found');

    await fs.remove(tmpDir);
  });
});

