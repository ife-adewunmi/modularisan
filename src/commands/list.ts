import type { Command } from 'commander'
import { ConfigManager } from '../core/config-manager'
import { ModuleService } from '../core/module-service'
import { logSuccess, logError, logInfo } from '../utils/logger'
import chalk from 'chalk'

export function listCommand(program: Command): void {
  program
    .command('list [type]')
    .description('List modules, components, or other project entities')
    .option('-d, --detailed', 'Show detailed information')
    .option('--json', 'Output as JSON')
    .action(async (type = 'modules', options) => {
      try {
        // Load configuration
        const configManager = new ConfigManager()
        let config
        
        try {
          config = await configManager.loadConfig()
        } catch (error) {
          logError('No configuration found. Please run "misan init" first.')
          return
        }

        const moduleService = new ModuleService(config)

        switch (type.toLowerCase()) {
          case 'modules':
          case 'module':
            await listModules(moduleService, options)
            break
          case 'frameworks':
          case 'framework':
            await listSupportedFrameworks(options)
            break
          case 'templates':
          case 'template':
            await listTemplates(options)
            break
          default:
            logError(`Unknown list type: ${type}. Available types: modules, frameworks, templates`)
            break
        }
        
      } catch (error) {
        logError(`Failed to list ${type}: ${(error as Error).message}`)
      }
    })
}

async function listModules(moduleService: ModuleService, options: any): Promise<void> {
  const modules = await moduleService.listModules()
  
  if (modules.length === 0) {
    logInfo('No modules found. Create your first module with: misan create:module <name>')
    return
  }

  if (options.json) {
    console.log(JSON.stringify(modules, null, 2))
    return
  }

  console.log(chalk.cyan(`Found ${modules.length} module(s):\n`))
  
  modules.forEach((module, index) => {
    console.log(chalk.green(`${index + 1}. ${module.name}`))
    
    if (options.detailed) {
      console.log(`   Path: ${chalk.gray(module.path)}`)
      console.log(`   Components: ${chalk.blue(module.components.join(', '))}`)
      console.log(`   Features:`)
      console.log(`   Routing: ${module.hasRouting ? chalk.green('✓') : chalk.red('✗')}`)
      console.log(`   API: ${module.hasApi ? chalk.green('✓') : chalk.red('✗')}`)
      console.log(`     Tests: ${module.hasTests ? chalk.green('✓') : chalk.red('✗')}`)
      console.log(`     Standalone: ${module.isStandalone ? chalk.green('✓') : chalk.red('✗')}`)
      console.log('')
    }
  })
  
  if (!options.detailed) {
    console.log(chalk.gray('\nUse --detailed flag for more information'))
  }
}

async function listSupportedFrameworks(options: any): Promise<void> {
  const frameworks = [
    { name: 'Next.js', type: 'fullstack', description: 'React framework with SSR/SSG' },
    { name: 'Nuxt.js', type: 'fullstack', description: 'Vue framework with SSR/SSG' },
    { name: 'React', type: 'frontend', description: 'JavaScript library for building UIs' },
    { name: 'Vue.js', type: 'frontend', description: 'Progressive framework for building UIs' },
    { name: 'Svelte', type: 'frontend', description: 'Compile-time framework' },
    { name: 'Angular', type: 'frontend', description: 'Platform for building web applications' },
    { name: 'Nest.js', type: 'backend', description: 'Node.js framework for building APIs' },
    { name: 'Express.js', type: 'backend', description: 'Minimal Node.js web framework' }
  ]

  if (options.json) {
    console.log(JSON.stringify(frameworks, null, 2))
    return
  }

  console.log(chalk.cyan('Supported Frameworks:\n'))
  
  const grouped = frameworks.reduce((acc, framework) => {
    if (!acc[framework.type]) acc[framework.type] = []
    acc[framework.type].push(framework)
    return acc
  }, {} as Record<string, typeof frameworks>)

  Object.entries(grouped).forEach(([type, items]) => {
    console.log(chalk.yellow(`${type.charAt(0).toUpperCase() + type.slice(1)}:`))
    items.forEach(framework => {
      console.log(`  ${chalk.green(framework.name)} - ${chalk.gray(framework.description)}`)
    })
    console.log('')
  })
}

async function listTemplates(options: any): Promise<void> {
  const templates = {
    module: [
      { name: 'basic', description: 'Components, services, types' },
      { name: 'full', description: 'All components including hooks, utils, tests' },
      { name: 'api', description: 'Services, types, controllers, middleware' },
      { name: 'ui', description: 'Components, hooks, types, styles' }
    ],
    component: [
      { name: 'functional', description: 'Functional React/Vue component' },
      { name: 'class', description: 'Class-based component' },
      { name: 'hook', description: 'Custom hook' }
    ]
  }

  if (options.json) {
    console.log(JSON.stringify(templates, null, 2))
    return
  }

  console.log(chalk.cyan('Available Templates:\n'))
  
  Object.entries(templates).forEach(([category, items]) => {
    console.log(chalk.yellow(`${category.charAt(0).toUpperCase() + category.slice(1)} Templates:`))
    items.forEach(template => {
      console.log(`  ${chalk.green(template.name)} - ${chalk.gray(template.description)}`)
    })
    console.log('')
  })
}

