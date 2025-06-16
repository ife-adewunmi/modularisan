import type { Command } from 'commander'
import inquirer from 'inquirer'
import { ConfigManager } from '../core/config-manager'
import { ModuleService } from '../core/module-service'
import { logSuccess, logError } from '../utils/logger'
import { validateComponentName, validateName } from '../utils/validators'
import chalk from 'chalk'

export function createComponentCommand(program: Command): void {
  program
    .command('create:component [name] [module]')
    .alias('component')
    .description('Create a new component in the specified module')
    .option('-t, --type <type>', 'Component type (functional, class, hook)', 'functional')
    .option('--props', 'Include props in the component', true)
    .option('--client', 'Create client-side component (use client)')
    .option('--story', 'Create Storybook story file')
    .option('--test', 'Create test file', true)
    .option('-y, --yes', 'Skip interactive prompts and use defaults')
    .action(async (name, moduleName, options) => {
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

        // Get component name and module
        if (!name || !moduleName) {
          if (options.yes) {
            logError('Component name and module are required when using --yes flag')
            return
          }
          
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'What is the name of the component?',
              when: () => !name,
              validate: (input) => {
                if (!input) return 'Component name is required'
                if (!validateName(input)) return 'Invalid component name. Use kebab-case (e.g., login-form)'
                return true
              }
            },
            {
              type: 'input',
              name: 'moduleName',
              message: 'Which module should contain this component?',
              when: () => !moduleName,
              validate: (input) => {
                if (!input) return 'Module name is required'
                return true
              }
            }
          ])
          
          name = name || answers.name
          moduleName = moduleName || answers.moduleName
        }

        // Validate component name
        if (!validateName(name)) {
          logError('Invalid component name. Use kebab-case (e.g., login-form)')
          return
        }

        // Interactive options if not using --yes flag
        let componentOptions = {
          name,
          moduleName,
          type: options.type,
          props: options.props !== false,
          client: options.client || false,
          story: options.story || false,
          test: options.test !== false
        }

        if (!options.yes) {
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'type',
              message: 'Choose component type:',
              choices: [
                { name: 'Functional Component', value: 'functional' },
                { name: 'Class Component', value: 'class' },
                { name: 'Custom Hook', value: 'hook' }
              ],
              default: options.type
            },
            {
              type: 'checkbox',
              name: 'features',
              message: 'Select component features:',
              choices: [
                {
                  name: 'Props interface',
                  value: 'props',
                  checked: componentOptions.props
                },
                {
                  name: 'Client-side component ("use client")',
                  value: 'client',
                  checked: componentOptions.client,
                  disabled: config.framework.type === 'backend'
                },
                {
                  name: 'Storybook story',
                  value: 'story',
                  checked: componentOptions.story
                },
                {
                  name: 'Test file',
                  value: 'test',
                  checked: componentOptions.test
                }
              ]
            }
          ])

          componentOptions = {
            ...componentOptions,
            type: answers.type,
            props: answers.features.includes('props'),
            client: answers.features.includes('client'),
            story: answers.features.includes('story'),
            test: answers.features.includes('test')
          }
        }

        // Create component
        const moduleService = new ModuleService(config)
        await moduleService.createComponent(componentOptions)

        // Success message
        logSuccess(`Component '${name}' created successfully in module '${moduleName}'!`)
        console.log('')
        console.log(chalk.cyan('Component Details:'))
        console.log(`  Name: ${chalk.green(name)}`)
        console.log(`  Module: ${chalk.green(moduleName)}`)
        console.log(`  Type: ${chalk.green(componentOptions.type)}`)
        console.log(`  Props: ${chalk.green(componentOptions.props ? 'Yes' : 'No')}`)
        console.log(`  Client-side: ${chalk.green(componentOptions.client ? 'Yes' : 'No')}`)
        console.log(`  Story: ${chalk.green(componentOptions.story ? 'Yes' : 'No')}`)
        console.log(`  Test: ${chalk.green(componentOptions.test ? 'Yes' : 'No')}`)
        
      } catch (error) {
        logError(`Failed to create component: ${(error as Error).message}`)
      }
    })
}
