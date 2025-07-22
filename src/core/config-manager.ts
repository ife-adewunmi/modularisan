import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import { ProjectStructure, FrameworkConfig } from './framework-detector'
import { logInfo, logError, logSuccess } from '../utils/logger'

export interface ModularisanConfig {
  version: string
  framework: {
    features: any
    name: string
    type: 'frontend' | 'backend' | 'fullstack'
    version?: string
  }
  project: {
    name: string
    description?: string
    rootDir: string
    packageManager: 'npm' | 'yarn' | 'pnpm'
  }
  paths: {
    modules: string
    shared: string
    tests: string
    stubs?: string
  }
  features: {
    typescript: boolean
    testing: boolean
    standalone_modules: boolean
    package_per_module: boolean
  }
  templates: {
    component: string
    service: string
    test: string
    module: string
  }
  conventions: {
    naming: 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case'
    file_extensions: Record<string, string>
  }
  ai?: {
    enabled: boolean
    provider?: 'openai' | 'anthropic' | 'local'
    model?: string
    api_key?: string
  }
}

const DEFAULT_CONFIG: Partial<ModularisanConfig> = {
  version: '2.0.0',
  features: {
    typescript: true,
    testing: true,
    standalone_modules: false,
    package_per_module: false
  },
  conventions: {
    naming: 'kebab-case',
    file_extensions: {}
  },
  ai: {
    enabled: false
  }
}

const CONFIG_FILE_NAME = 'modularisan.config.yml'
const LEGACY_CONFIG_NAMES = ['nextisan.config.yml', 'nextisan.config.json']

export class ConfigManager {
  private rootDir: string
  private configPath: string
  private config: ModularisanConfig | null = null

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir
    this.configPath = path.join(rootDir, CONFIG_FILE_NAME)
  }

  async initializeConfig(projectStructure: ProjectStructure, options: Partial<ModularisanConfig> = {}): Promise<ModularisanConfig> {
    const { framework, hasTypeScript, hasTesting, packageManager } = projectStructure
    
    // Get project name from package.json
    const packageJsonPath = path.join(this.rootDir, 'package.json')
    let projectName = 'my-project'
    let projectDescription = ''
    
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath)
      projectName = packageJson.name || 'my-project'
      projectDescription = packageJson.description || ''
    }

    const config: ModularisanConfig = {
      ...DEFAULT_CONFIG,
      version: DEFAULT_CONFIG.version!,
      framework: {
        name: framework.name,
        type: framework.type,
        version: framework.version,
        features: framework.features
      },
      project: {
        name: projectName,
        description: projectDescription,
        rootDir: this.rootDir,
        packageManager
      },
      paths: {
        modules: framework.paths.modules,
        shared: framework.paths.shared,
        tests: framework.paths.tests
      },
      features: {
        ...DEFAULT_CONFIG.features!,
        typescript: hasTypeScript,
        testing: hasTesting
      },
      templates: {
        component: this.getDefaultTemplate(framework, 'component'),
        service: this.getDefaultTemplate(framework, 'service'),
        test: this.getDefaultTemplate(framework, 'test'),
        module: this.getDefaultTemplate(framework, 'module')
      },
      conventions: {
        ...DEFAULT_CONFIG.conventions!,
        file_extensions: framework.extensions
      },
      ...options
    }

    await this.saveConfig(config)
    this.config = config
    
    logSuccess(`Configuration initialized for ${framework.name} project`)
    return config
  }

  async loadConfig(): Promise<ModularisanConfig> {
    if (this.config) {
      return this.config
    }

    // Check for existing config file
    if (await fs.pathExists(this.configPath)) {
      try {
        const configContent = await fs.readFile(this.configPath, 'utf8')
        this.config = yaml.parse(configContent) as ModularisanConfig
        return this.config
      } catch (error) {
        logError(`Failed to parse config file: ${(error as Error).message}`)
        throw new Error('Invalid configuration file')
      }
    }

    // Check for legacy config files
    for (const legacyName of LEGACY_CONFIG_NAMES) {
      const legacyPath = path.join(this.rootDir, legacyName)
      if (await fs.pathExists(legacyPath)) {
        logInfo(`Found legacy config file: ${legacyName}. Consider migrating to ${CONFIG_FILE_NAME}`)
        try {
          const configContent = await fs.readFile(legacyPath, 'utf8')
          this.config = legacyName.endsWith('.json') 
            ? JSON.parse(configContent)
            : yaml.parse(configContent)
          
          // Migrate to new format
          await this.saveConfig(this.config!)
          await fs.remove(legacyPath)
          logSuccess(`Migrated configuration from ${legacyName} to ${CONFIG_FILE_NAME}`)
          
          return this.config!
        } catch (error) {
          logError(`Failed to migrate legacy config: ${(error as Error).message}`)
        }
      }
    }

    throw new Error(`No configuration found. Run 'misan init' to initialize the project.`)
  }

  async saveConfig(config: ModularisanConfig): Promise<void> {
    try {
      const yamlContent = yaml.stringify(config, {
        indent: 2,
        lineWidth: 100,
        minContentWidth: 0,
        doubleQuotedAsJSON: false
      })
      
      await fs.writeFile(this.configPath, yamlContent, 'utf8')
      this.config = config
      logInfo(`Configuration saved to ${CONFIG_FILE_NAME}`)
    } catch (error) {
      logError(`Failed to save configuration: ${(error as Error).message}`)
      throw error
    }
  }

  async updateConfig(updates: Partial<ModularisanConfig>): Promise<ModularisanConfig> {
    const currentConfig = await this.loadConfig()
    const updatedConfig = this.deepMerge(currentConfig, updates)
    await this.saveConfig(updatedConfig)
    return updatedConfig
  }

  getConfigPath(): string {
    return this.configPath
  }

  hasConfig(): Promise<boolean> {
    return fs.pathExists(this.configPath)
  }

  private getDefaultTemplate(framework: FrameworkConfig, type: string): string {
    const frameworkKey = framework.name.toLowerCase().split('.')[0] // 'next.js' -> 'next'
    return `${frameworkKey}/${type}`
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  async validateConfig(config?: ModularisanConfig): Promise<boolean> {
    const configToValidate = config || await this.loadConfig()
    
    // Basic validation
    if (!configToValidate.framework?.name) {
      logError('Invalid config: Framework name is required')
      return false
    }

    if (!configToValidate.project?.name) {
      logError('Invalid config: Project name is required')
      return false
    }

    if (!configToValidate.paths?.modules) {
      logError('Invalid config: Modules path is required')
      return false
    }

    // Validate paths exist
    const modulesPath = path.join(configToValidate.project.rootDir, configToValidate.paths.modules)
    if (!await fs.pathExists(modulesPath)) {
      logError(`Modules directory does not exist: ${modulesPath}`)
      return false
    }

    return true
  }

  static getDefaultConfigTemplate(): Partial<ModularisanConfig> {
    return DEFAULT_CONFIG
  }
}

