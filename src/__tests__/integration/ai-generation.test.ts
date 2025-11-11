import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach } from 'vitest';

import { AIService } from '../../core/ai-service';
import type { ModularisanConfig } from '../../core/config-manager';

describe('Integration — AI code saving', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-test-'));
  });

  it('saves generated code, tests and docs to disk', async () => {
    const targetPath = path.join(tmpDir, 'modules', 'user-auth', 'services');

    await fs.ensureDir(targetPath);

    const config = {
      version: 'test',
      framework: { name: 'Test', type: 'frontend', features: {} },
      project: { name: 'test', rootDir: tmpDir, packageManager: 'npm' },
      paths: { modules: 'modules', shared: 'shared', tests: '__tests__' },
      features: {
        typescript: true,
        testing: true,
        standalone_modules: false,
        package_per_module: false,
      },
      templates: {
        component: 'test',
        service: 'test',
        test: 'test',
        module: 'test',
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

    const aiService = new AIService(config);

    const response = {
      code: "export const hello = () => 'hello';\n",
      explanation: 'A simple exported function',
      suggestions: [],
      tests: "import { hello } from './my-service';\nexpect(hello()).toBe('hello');\n",
      documentation: '# My Service\nThis service does X',
    } as any;

    await aiService.saveGeneratedCode(response, targetPath, 'my-service.ts');

    // Assert files exist
    expect(await fs.pathExists(path.join(targetPath, 'my-service.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(targetPath, 'my-service.test.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(targetPath, 'my-service.md'))).toBe(true);

    // Verify content
    const codeContent = await fs.readFile(path.join(targetPath, 'my-service.ts'), 'utf-8');
    expect(codeContent).toContain('hello');

    await fs.remove(tmpDir);
  });

  it('respects dry-run mode and does not write files', async () => {
    const targetPath = path.join(tmpDir, 'modules', 'user-auth', 'services');

    const config = {
      version: 'test',
      framework: { name: 'Test', type: 'frontend', features: {} },
      project: { name: 'test', rootDir: tmpDir, packageManager: 'npm' },
      paths: { modules: 'modules', shared: 'shared', tests: '__tests__' },
      features: {
        typescript: true,
        testing: true,
        standalone_modules: false,
        package_per_module: false,
      },
      templates: {
        component: 'test',
        service: 'test',
        test: 'test',
        module: 'test',
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

    const aiService = new AIService(config);

    const response = {
      code: "export const hello = () => 'hello';\n",
      explanation: 'A simple exported function',
      suggestions: [],
      tests: "import { hello } from './my-service';\nexpect(hello()).toBe('hello');\n",
      documentation: '# My Service\nThis service does X',
    } as any;

    await aiService.saveGeneratedCode(response, targetPath, 'my-service.ts', true);

    // Files should NOT exist in dry-run mode
    expect(await fs.pathExists(path.join(targetPath, 'my-service.ts'))).toBe(false);

    await fs.remove(tmpDir);
  });
});

