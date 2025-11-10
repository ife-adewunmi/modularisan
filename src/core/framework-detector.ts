import path from 'path';

import fs from 'fs-extra';

import { logInfo, logError } from '@/utils/logger';
import type { PackageManager } from '@/utils/types';

export interface FrameworkConfig {
  name: string;
  version?: string;
  type: 'frontend' | 'backend' | 'fullstack';
  features: {
    routing: boolean;
    api: boolean;
    ssr: boolean;
    typescript: boolean;
    testing: boolean;
  };
  paths: {
    src: string;
    components: string;
    pages?: string;
    api?: string;
    modules: string;
    shared: string;
    tests: string;
  };
  extensions: {
    component: string;
    page: string;
    api: string;
    service: string;
    test: string;
  };
}

export interface ProjectStructure {
  framework: FrameworkConfig;
  hasTypeScript: boolean;
  hasTesting: boolean;
  packageManager: PackageManager;
  rootDir: string;
}

const FRAMEWORK_CONFIGS: Record<string, Partial<FrameworkConfig>> = {
  next: {
    name: 'Next.js',
    type: 'fullstack',
    features: {
      routing: true,
      api: true,
      ssr: true,
      typescript: true,
      testing: true,
    },
    paths: {
      src: 'src',
      components: 'src/components',
      pages: 'src/app',
      api: 'src/app/api',
      modules: 'src/modules',
      shared: 'src/shared',
      tests: '__tests__',
    },
    extensions: {
      component: '.tsx',
      page: '.tsx',
      api: '.ts',
      service: '.ts',
      test: '.test.ts',
    },
  },
  nuxt: {
    name: 'Nuxt.js',
    type: 'fullstack',
    features: {
      routing: true,
      api: true,
      ssr: true,
      typescript: true,
      testing: true,
    },
    paths: {
      src: '.',
      components: 'components',
      pages: 'pages',
      api: 'server/api',
      modules: 'modules',
      shared: 'shared',
      tests: 'tests',
    },
    extensions: {
      component: '.vue',
      page: '.vue',
      api: '.ts',
      service: '.ts',
      test: '.test.ts',
    },
  },
  nest: {
    name: 'Nest.js',
    type: 'backend',
    features: {
      routing: true,
      api: true,
      ssr: false,
      typescript: true,
      testing: true,
    },
    paths: {
      src: 'src',
      components: 'src/components',
      modules: 'src/modules',
      shared: 'src/shared',
      tests: 'test',
    },
    extensions: {
      component: '.ts',
      page: '.ts',
      api: '.ts',
      service: '.ts',
      test: '.spec.ts',
    },
  },
  react: {
    name: 'React',
    type: 'frontend',
    features: {
      routing: false,
      api: false,
      ssr: false,
      typescript: true,
      testing: true,
    },
    paths: {
      src: 'src',
      components: 'src/components',
      modules: 'src/modules',
      shared: 'src/shared',
      tests: '__tests__',
    },
    extensions: {
      component: '.tsx',
      page: '.tsx',
      api: '.ts',
      service: '.ts',
      test: '.test.ts',
    },
  },
  vue: {
    name: 'Vue.js',
    type: 'frontend',
    features: {
      routing: false,
      api: false,
      ssr: false,
      typescript: true,
      testing: true,
    },
    paths: {
      src: 'src',
      components: 'src/components',
      modules: 'src/modules',
      shared: 'src/shared',
      tests: 'tests',
    },
    extensions: {
      component: '.vue',
      page: '.vue',
      api: '.ts',
      service: '.ts',
      test: '.test.ts',
    },
  },
  svelte: {
    name: 'Svelte',
    type: 'frontend',
    features: {
      routing: false,
      api: false,
      ssr: false,
      typescript: true,
      testing: true,
    },
    paths: {
      src: 'src',
      components: 'src/components',
      modules: 'src/modules',
      shared: 'src/shared',
      tests: 'tests',
    },
    extensions: {
      component: '.svelte',
      page: '.svelte',
      api: '.ts',
      service: '.ts',
      test: '.test.ts',
    },
  },
  angular: {
    name: 'Angular',
    type: 'frontend',
    features: {
      routing: true,
      api: false,
      ssr: false,
      typescript: true,
      testing: true,
    },
    paths: {
      src: 'src',
      components: 'src/app/components',
      modules: 'src/app/modules',
      shared: 'src/app/shared',
      tests: 'src/tests',
    },
    extensions: {
      component: '.component.ts',
      page: '.component.ts',
      api: '.service.ts',
      service: '.service.ts',
      test: '.spec.ts',
    },
  },
  express: {
    name: 'Express.js',
    type: 'backend',
    features: {
      routing: true,
      api: true,
      ssr: false,
      typescript: true,
      testing: true,
    },
    paths: {
      src: 'src',
      components: 'src/components',
      modules: 'src/modules',
      shared: 'src/shared',
      tests: 'tests',
    },
    extensions: {
      component: '.ts',
      page: '.ts',
      api: '.ts',
      service: '.ts',
      test: '.test.ts',
    },
  },
};

export class FrameworkDetector {
  private rootDir: string;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }

  async detectFramework(): Promise<ProjectStructure> {
    const packageJsonPath = path.join(this.rootDir, 'package.json');

    if (!(await fs.pathExists(packageJsonPath))) {
      throw new Error(
        'No package.json found. Please run this command in a project directory.'
      );
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Detect framework
    let detectedFramework = 'react'; // default fallback

    if (dependencies.next) {
      detectedFramework = 'next';
    } else if (dependencies.nuxt || dependencies['@nuxt/kit']) {
      detectedFramework = 'nuxt';
    } else if (dependencies['@nestjs/core']) {
      detectedFramework = 'nest';
    } else if (dependencies.vue || dependencies['@vue/cli-service']) {
      detectedFramework = 'vue';
    } else if (dependencies.svelte || dependencies['@sveltejs/kit']) {
      detectedFramework = 'svelte';
    } else if (dependencies['@angular/core']) {
      detectedFramework = 'angular';
    } else if (dependencies.express) {
      detectedFramework = 'express';
    }

    // Get framework config
    const frameworkConfig = this.getFrameworkConfig(detectedFramework);

    // Detect additional features
    const hasTypeScript = !!(
      dependencies.typescript ||
      (await fs.pathExists(path.join(this.rootDir, 'tsconfig.json')))
    );
    const hasTesting = !!(
      dependencies.jest ||
      dependencies.vitest ||
      dependencies['@testing-library/react']
    );

    // Detect package manager
    let packageManager: PackageManager = 'npm';
    if (await fs.pathExists(path.join(this.rootDir, 'yarn.lock'))) {
      packageManager = 'yarn';
    } else if (await fs.pathExists(path.join(this.rootDir, 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    }

    // Get framework version
    if (dependencies[detectedFramework]) {
      frameworkConfig.version = dependencies[detectedFramework];
    }

    const projectStructure: ProjectStructure = {
      framework: frameworkConfig,
      hasTypeScript,
      hasTesting,
      packageManager,
      rootDir: this.rootDir,
    };

    logInfo(`Detected framework: ${frameworkConfig.name}`);
    logInfo(`TypeScript: ${hasTypeScript ? 'Yes' : 'No'}`);
    logInfo(`Testing: ${hasTesting ? 'Yes' : 'No'}`);
    logInfo(`Package Manager: ${packageManager}`);

    return projectStructure;
  }

  private getFrameworkConfig(framework: string): FrameworkConfig {
    const baseConfig = FRAMEWORK_CONFIGS[framework];
    if (!baseConfig) {
      logError(`Unknown framework: ${framework}. Using React as fallback.`);
      return FRAMEWORK_CONFIGS.react as FrameworkConfig;
    }
    return baseConfig as FrameworkConfig;
  }

  async validateProjectStructure(
    structure: ProjectStructure
  ): Promise<boolean> {
    const { framework, rootDir } = structure;

    // Check if basic structure exists
    const srcPath = path.join(rootDir, framework.paths.src);
    const srcExists = await fs.pathExists(srcPath);

    if (!srcExists) {
      logError(`Source directory not found: ${srcPath}`);
      return false;
    }

    return true;
  }

  static getSupportedFrameworks(): string[] {
    return Object.keys(FRAMEWORK_CONFIGS);
  }
}
