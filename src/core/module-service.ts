import fs from 'fs-extra'
import path from 'path'
import { ModularisanConfig } from './config-manager'
import { renderTemplate } from '../utils/template'
import { ensureDirectoryExists } from '../utils/file'
import { logInfo, logError, logSuccess } from '../utils/logger'
import { validateName, toPascalCase, toCamelCase, toKebabCase } from '../utils/validators'
import { DEFAULT_MODULE_COMPONENTS, MODULE_TEMPLATES } from '../utils/types'

export interface ModuleStructure {
  name: string
  path: string
  components: string[]
  hasRouting: boolean
  hasApi: boolean
  hasTests: boolean
  isStandalone: boolean
  hasPackageJson: boolean
}

export interface CreateModuleOptions {
  name: string
  description?: string
  path?: string
  components?: string[]
  routing?: boolean
  api?: boolean
  tests?: boolean
  standalone?: boolean
  packageJson?: boolean
  template?: string
}

export interface CreateComponentOptions {
  name: string
  moduleName: string
  type?: 'functional' | 'class' | 'hook' | 'service' | 'type' | 'test'
  props?: boolean
  client?: boolean
  story?: boolean
  test?: boolean
}

// const DEFAULT_MODULE_COMPONENTS = [
//   'components',
//   'services', 
//   'types',
//   'hooks',
//   'utils'
// ]

// const MODULE_TEMPLATES = {
//   basic: ['components', 'services', 'types'],
//   full: ['components', 'services', 'types', 'hooks', 'utils', 'tests'],
//   api: ['services', 'types', 'controllers', 'middleware'],
//   ui: ['components', 'hooks', 'types', 'styles']
// }

export class ModuleService {
  private config: ModularisanConfig
  private rootDir: string

  constructor(config: ModularisanConfig) {
    this.config = config
    this.rootDir = config.project.rootDir
  }

  async createModule(options: CreateModuleOptions): Promise<ModuleStructure> {
    const {
      name,
      description = '',
      path: customPath,
      components = this.getDefaultComponents(options.template),
      routing = false,
      api = false,
      tests = this.config.features.testing,
      standalone = this.config.features.standalone_modules,
      packageJson = this.config.features.package_per_module,
      template = 'basic'
    } = options

    // Validate module name
    if (!validateName(name)) {
      throw new Error('Invalid module name. Use kebab-case (e.g., user-management)')
    }

    // Determine module path
    const modulePath = customPath 
      ? path.join(this.rootDir, customPath, name)
      : path.join(this.rootDir, this.config.paths.modules, name)

    // Check if module already exists
    if (await fs.pathExists(modulePath)) {
      throw new Error(`Module '${name}' already exists at ${modulePath}`)
    }

    logInfo(`Creating module: ${name}`)
    
    // Create module directory
    await ensureDirectoryExists(modulePath)

    // Create module structure
    const moduleStructure: ModuleStructure = {
      name,
      path: modulePath,
      components,
      hasRouting: routing,
      hasApi: api,
      hasTests: tests,
      isStandalone: standalone,
      hasPackageJson: packageJson
    }

    // Create subdirectories
    await this.createModuleDirectories(moduleStructure)

    // Create module files
    await this.createModuleFiles(moduleStructure, description)

    // Create package.json if requested
    if (packageJson) {
      await this.createModulePackageJson(moduleStructure, description)
    }

    // Create routing files if requested
    if (routing && this.config.framework.type !== 'backend') {
      await this.createRoutingFiles(moduleStructure)
    }

    // Create API files if requested
    if (api && this.config.framework.features?.api) {
      await this.createApiFiles(moduleStructure)
    }

    // Create test files if requested
    if (tests) {
      await this.createTestFiles(moduleStructure)
    }

    logSuccess(`Module '${name}' created successfully at ${modulePath}`)
    return moduleStructure
  }

  async createComponent(options: CreateComponentOptions): Promise<void> {
    const { name, moduleName, type = 'functional', props = true, client = false, story = false, test = false } = options

    // Validate component name
    if (!validateName(name)) {
      throw new Error('Invalid component name. Use kebab-case (e.g., login-form)')
    }

    // Find module path
    const modulePath = await this.findModulePath(moduleName)
    if (!modulePath) {
      throw new Error(`Module '${moduleName}' not found`)
    }

    const componentDir = path.join(modulePath, 'components')
    await ensureDirectoryExists(componentDir)

    // Create component file
    await this.createComponentFile(name, componentDir, type, { props, client })

    // Create story file if requested
    if (story) {
      await this.createStoryFile(name, componentDir)
    }

    // Create test file if requested
    if (test) {
      await this.createComponentTestFile(name, componentDir)
    }

    // Update component index
    await this.updateComponentIndex(componentDir, name)

    logSuccess(`Component '${name}' created in module '${moduleName}'`)
  }

  async createService(moduleName: string, serviceName: string, isServer = false): Promise<void> {
    // Validate service name
    if (!validateName(serviceName)) {
      throw new Error('Invalid service name. Use kebab-case (e.g., user-service)')
    }

    // Find module path
    const modulePath = await this.findModulePath(moduleName)
    if (!modulePath) {
      throw new Error(`Module '${moduleName}' not found`)
    }

    const servicesDir = path.join(modulePath, 'services')
    await ensureDirectoryExists(servicesDir)

    // Create service file
    const templateData = {
      name: serviceName,
      className: toPascalCase(serviceName),
      isServer,
      framework: this.config.framework.name
    }

    const serviceContent = await renderTemplate(
      `${this.config.templates.service}${this.config.conventions.file_extensions.service}`,
      templateData
    )

    const fileName = `${serviceName}${this.config.conventions.file_extensions.service}`
    await fs.writeFile(path.join(servicesDir, fileName), serviceContent)

    // Create test file if testing is enabled
    if (this.config.features.testing) {
      await this.createServiceTestFile(serviceName, servicesDir)
    }

    // Update services index
    await this.updateServicesIndex(servicesDir, serviceName)

    logSuccess(`Service '${serviceName}' created in module '${moduleName}'`)
  }

  async listModules(): Promise<ModuleStructure[]> {
    const modulesPath = path.join(this.rootDir, this.config.paths.modules)
    
    if (!await fs.pathExists(modulesPath)) {
      return []
    }

    const modules: ModuleStructure[] = []
    const entries = await fs.readdir(modulesPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const modulePath = path.join(modulesPath, entry.name)
        const moduleStructure = await this.analyzeModule(entry.name, modulePath)
        if (moduleStructure) {
          modules.push(moduleStructure)
        }
      }
    }

    return modules
  }

  async deleteModule(name: string, force = false): Promise<void> {
    const modulePath = await this.findModulePath(name)
    if (!modulePath) {
      throw new Error(`Module '${name}' not found`)
    }

    if (!force) {
      // You might want to add confirmation logic here
      logInfo(`This will permanently delete the module '${name}' and all its contents.`)
    }

    await fs.remove(modulePath)
    logSuccess(`Module '${name}' deleted successfully`)
  }

  private async createModuleDirectories(moduleStructure: ModuleStructure): Promise<void> {
    const { path: modulePath, components } = moduleStructure

    // Create component directories
    for (const component of components) {
      await ensureDirectoryExists(path.join(modulePath, component))
      logInfo(`Creating ${component} directory`)
    }

    // Create additional directories based on features
    if (moduleStructure.hasRouting) {
      await ensureDirectoryExists(path.join(modulePath, 'pages'))
      await ensureDirectoryExists(path.join(modulePath, 'routes'))
    }

    if (moduleStructure.hasApi) {
      await ensureDirectoryExists(path.join(modulePath, 'api'))
      await ensureDirectoryExists(path.join(modulePath, 'controllers'))
    }

    if (moduleStructure.hasTests) {
      await ensureDirectoryExists(path.join(modulePath, 'tests'))
    }
  }

  private async createModuleFiles(moduleStructure: ModuleStructure, description: string): Promise<void> {
    const { name, path: modulePath } = moduleStructure

    // Create module index file
    const indexContent = await renderTemplate(
      `${this.config.templates.module}/index${this.config.conventions.file_extensions.component}`,
      { name, description, components: moduleStructure.components }
    )
    
    const indexFile = `index${this.config.conventions.file_extensions.component}`
    await fs.writeFile(path.join(modulePath, indexFile), indexContent)

    // Create README.md
    const readmeContent = await renderTemplate(
      'common/module-readme.ejs',
      { name, description, components: moduleStructure.components }
    )
    await fs.writeFile(path.join(modulePath, 'README.md'), readmeContent)

    // Create component index files
    for (const component of moduleStructure.components) {
      const componentIndexPath = path.join(modulePath, component, 'index.ts')
      await fs.writeFile(componentIndexPath, `// Export all ${component} from this directory\n`)
    }
  }

  private async createModulePackageJson(moduleStructure: ModuleStructure, description: string): Promise<void> {
    const { name, path: modulePath } = moduleStructure
    
    const packageJson = {
      name: `@${this.config.project.name}/${name}`,
      version: '1.0.0',
      description: description || `${name} module`,
      main: 'index.ts',
      private: true,
      scripts: {
        test: 'jest',
        'test:watch': 'jest --watch',
        'type-check': 'tsc --noEmit'
      },
      peerDependencies: {
        ...(this.config.framework.name.includes('React') && { react: '^18.0.0', 'react-dom': '^18.0.0' }),
        ...(this.config.framework.name.includes('Vue') && { vue: '^3.0.0' }),
        ...(this.config.features.typescript && { typescript: '^5.0.0' })
      },
      devDependencies: {
        ...(this.config.features.testing && { jest: '^29.0.0' }),
        ...(this.config.features.typescript && { '@types/node': '^20.0.0' })
      }
    }

    await fs.writeJson(path.join(modulePath, 'package.json'), packageJson, { spaces: 2 })
  }

  private async createRoutingFiles(moduleStructure: ModuleStructure): Promise<void> {
    // Implementation depends on framework
    // This is a placeholder - you'd implement framework-specific routing
  }

  private async createApiFiles(moduleStructure: ModuleStructure): Promise<void> {
    // Implementation depends on framework
    // This is a placeholder - you'd implement framework-specific API files
  }

  private async createTestFiles(moduleStructure: ModuleStructure): Promise<void> {
    const { path: modulePath } = moduleStructure
    const testsDir = path.join(modulePath, 'tests')
    
    // Create basic test file
    const testContent = await renderTemplate(
      `${this.config.templates.test}${this.config.conventions.file_extensions.test}`,
      { moduleName: moduleStructure.name }
    )
    
    const testFile = `${moduleStructure.name}${this.config.conventions.file_extensions.test}`
    await fs.writeFile(path.join(testsDir, testFile), testContent)
  }

  private async createComponentFile(
    name: string, 
    componentDir: string, 
    type: string, 
    options: { props: boolean; client: boolean }
  ): Promise<void> {
    const templateData = {
      name,
      componentName: toPascalCase(name),
      withProps: options.props,
      isClientComponent: options.client,
      framework: this.config.framework.name
    }

    const componentContent = await renderTemplate(
      `${this.config.templates.component}/${type}${this.config.conventions.file_extensions.component}`,
      templateData
    )

    const fileName = `${name}${this.config.conventions.file_extensions.component}`
    await fs.writeFile(path.join(componentDir, fileName), componentContent)
  }

  private async createStoryFile(name: string, componentDir: string): Promise<void> {
    // Create Storybook story file
    const storyContent = await renderTemplate(
      'common/story.ejs',
      { name, componentName: toPascalCase(name) }
    )
    
    await fs.writeFile(path.join(componentDir, `${name}.stories.tsx`), storyContent)
  }

  private async createComponentTestFile(name: string, componentDir: string): Promise<void> {
    const testContent = await renderTemplate(
      `${this.config.templates.test}${this.config.conventions.file_extensions.test}`,
      { name, componentName: toPascalCase(name), type: 'component' }
    )
    
    const testFile = `${name}${this.config.conventions.file_extensions.test}`
    await fs.writeFile(path.join(componentDir, testFile), testContent)
  }

  private async createServiceTestFile(serviceName: string, servicesDir: string): Promise<void> {
    const testContent = await renderTemplate(
      `${this.config.templates.test}${this.config.conventions.file_extensions.test}`,
      { name: serviceName, className: toPascalCase(serviceName), type: 'service' }
    )
    
    const testFile = `${serviceName}${this.config.conventions.file_extensions.test}`
    await fs.writeFile(path.join(servicesDir, testFile), testContent)
  }

  private async updateComponentIndex(componentDir: string, componentName: string): Promise<void> {
    const indexPath = path.join(componentDir, 'index.ts')
    const exportLine = `export * from './${componentName}'\n`
    
    if (await fs.pathExists(indexPath)) {
      const content = await fs.readFile(indexPath, 'utf8')
      if (!content.includes(exportLine)) {
        await fs.appendFile(indexPath, exportLine)
      }
    } else {
      await fs.writeFile(indexPath, exportLine)
    }
  }

  private async updateServicesIndex(servicesDir: string, serviceName: string): Promise<void> {
    const indexPath = path.join(servicesDir, 'index.ts')
    const exportLine = `export * from './${serviceName}'\n`
    
    if (await fs.pathExists(indexPath)) {
      const content = await fs.readFile(indexPath, 'utf8')
      if (!content.includes(exportLine)) {
        await fs.appendFile(indexPath, exportLine)
      }
    } else {
      await fs.writeFile(indexPath, exportLine)
    }
  }

  private async findModulePath(moduleName: string): Promise<string | null> {
    const modulesPath = path.join(this.rootDir, this.config.paths.modules)
    const modulePath = path.join(modulesPath, moduleName)
    
    if (await fs.pathExists(modulePath)) {
      return modulePath
    }
    
    return null
  }

  private async analyzeModule(name: string, modulePath: string): Promise<ModuleStructure | null> {
    try {
      const stats = await fs.stat(modulePath)
      if (!stats.isDirectory()) {
        return null
      }

      const entries = await fs.readdir(modulePath, { withFileTypes: true })
      const components = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(name => !name.startsWith('.'))

      const hasPackageJson = await fs.pathExists(path.join(modulePath, 'package.json'))
      const hasRouting = components.includes('pages') || components.includes('routes')
      const hasApi = components.includes('api') || components.includes('controllers')
      const hasTests = components.includes('tests') || components.includes('__tests__')

      return {
        name,
        path: modulePath,
        components,
        hasRouting,
        hasApi,
        hasTests,
        isStandalone: hasPackageJson,
        hasPackageJson
      }
    } catch (error) {
      logError(`Failed to analyze module ${name}: ${(error as Error).message}`)
      return null
    }
  }

  private getDefaultComponents(template?: string): string[] {
    if (template && MODULE_TEMPLATES[template as keyof typeof MODULE_TEMPLATES]) {
      return MODULE_TEMPLATES[template as keyof typeof MODULE_TEMPLATES]
    }
    return DEFAULT_MODULE_COMPONENTS
  }

  async createType(options: { name: string; moduleName: string; typeOptions: string[] }): Promise<void> {
    const { name, moduleName, typeOptions } = options

    // Validate type name
    if (!validateName(name)) {
      throw new Error('Invalid type name. Use kebab-case (e.g., user-types)')
    }

    // Find module path
    const modulePath = await this.findModulePath(moduleName)
    if (!modulePath) {
      throw new Error(`Module '${moduleName}' not found`)
    }

    const typesDir = path.join(modulePath, 'types')
    await ensureDirectoryExists(typesDir)

    // Create type file
    const templateData = {
      name,
      className: toPascalCase(name),
      typeOptions,
      framework: this.config.framework.name
    }

    const typeContent = await renderTemplate(
      `type/type${this.config.conventions.file_extensions.service}`,
      templateData
    )

    const fileName = `${name}${this.config.conventions.file_extensions.service}`
    await fs.writeFile(path.join(typesDir, fileName), typeContent)

    // Update types index
    await this.updateTypesIndex(typesDir, name)

    logSuccess(`Type '${name}' created in module '${moduleName}'`)
  }

  async createTest(options: { name: string; moduleName: string; testType: string }): Promise<void> {
    const { name, moduleName, testType } = options

    // Find module path
    const modulePath = await this.findModulePath(moduleName)
    if (!modulePath) {
      throw new Error(`Module '${moduleName}' not found`)
    }

    const testsDir = path.join(modulePath, 'tests')
    await ensureDirectoryExists(testsDir)

    // Create test file
    const templateData = {
      name,
      className: toPascalCase(name),
      testType,
      framework: this.config.framework.name
    }

    const testContent = await renderTemplate(
      `test/${testType}${this.config.conventions.file_extensions.test}`,
      templateData
    )

    const fileName = `${name}${this.config.conventions.file_extensions.test}`
    await fs.writeFile(path.join(testsDir, fileName), testContent)

    logSuccess(`Test '${name}' created in module '${moduleName}'`)
  }

  async createAPI(options: { name: string; moduleName: string; methods: string[]; withValidation: boolean }): Promise<void> {
    const { name, moduleName, methods, withValidation } = options

    // Validate API name
    if (!validateName(name)) {
      throw new Error('Invalid API name. Use kebab-case (e.g., user-api)')
    }

    // Find module path
    const modulePath = await this.findModulePath(moduleName)
    if (!modulePath) {
      throw new Error(`Module '${moduleName}' not found`)
    }

    const apiDir = path.join(modulePath, 'api')
    await ensureDirectoryExists(apiDir)

    // Create API file
    const templateData = {
      name,
      className: toPascalCase(name),
      methods,
      withValidation,
      framework: this.config.framework.name
    }

    const apiContent = await renderTemplate(
      `api/route${this.config.conventions.file_extensions.service}`,
      templateData
    )

    const fileName = `${name}${this.config.conventions.file_extensions.service}`
    await fs.writeFile(path.join(apiDir, fileName), apiContent)

    logSuccess(`API '${name}' created in module '${moduleName}'`)
  }

  private async updateTypesIndex(typesDir: string, typeName: string): Promise<void> {
    const indexPath = path.join(typesDir, 'index.ts')
    const exportLine = `export * from './${typeName}'\n`
    
    if (await fs.pathExists(indexPath)) {
      const content = await fs.readFile(indexPath, 'utf8')
      if (!content.includes(exportLine)) {
        await fs.appendFile(indexPath, exportLine)
      }
    } else {
      await fs.writeFile(indexPath, exportLine)
    }
  }
}

