import type { Command } from 'commander'
import inquirer from 'inquirer'
import { ConfigManager } from '../core/config-manager'
import { ModuleService } from '../core/module-service'
import { logSuccess, logError } from '../utils/logger'
import { validateName } from '../utils/validators'
import chalk from 'chalk'

export function createServiceCommand(program: Command): void {
  program
    .command('create:service [name] [module]')
    .alias('service')
    .description('Create a new service in the specified module')
    .option('--server', 'Create server-side service')
    .option('--client', 'Create client-side service')
    .option('--api', 'Include API endpoint templates')
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

        // Get service name and module
        if (!name || !moduleName) {
          if (options.yes) {
            logError('Service name and module are required when using --yes flag')
            return
          }
          
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'What is the name of the service?',
              when: () => !name,
              validate: (input) => {
                if (!input) return 'Service name is required'
                if (!validateName(input)) return 'Invalid service name. Use kebab-case (e.g., user-service)'
                return true
              }
            },
            {
              type: 'input',
              name: 'moduleName',
              message: 'Which module should contain this service?',
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

        // Validate service name
        if (!validateName(name)) {
          logError('Invalid service name. Use kebab-case (e.g., user-service)')
          return
        }

        // Interactive options if not using --yes flag
        let serviceOptions = {
          server: options.server || false,
          client: options.client || false,
          api: options.api || false,
          test: options.test !== false
        }

        if (!options.yes) {
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'serviceType',
              message: 'Choose service type:',
              choices: [
                { name: 'Client-side service (browser)', value: 'client' },
                { name: 'Server-side service (backend)', value: 'server' },
                { name: 'Universal service (both)', value: 'universal' }
              ],
              default: 'client'
            },
            {
              type: 'checkbox',
              name: 'features',
              message: 'Select service features:',
              choices: [
                {
                  name: 'API endpoint templates',
                  value: 'api',
                  checked: serviceOptions.api,
                  disabled: config.framework.type === 'frontend'
                },
                {
                  name: 'Test file',
                  value: 'test',
                  checked: serviceOptions.test
                },
                {
                  name: 'Error handling utilities',
                  value: 'error-handling',
                  checked: false
                },
                {
                  name: 'Validation schemas',
                  value: 'validation',
                  checked: false
                }
              ]
            }
          ])

          serviceOptions = {
            server: answers.serviceType === 'server' || answers.serviceType === 'universal',
            client: answers.serviceType === 'client' || answers.serviceType === 'universal',
            api: answers.features.includes('api'),
            test: answers.features.includes('test')
          }
        }

        // Determine if it's a server service based on options or framework
        const isServer = serviceOptions.server || config.framework.type === 'backend'

        // Create service
        const moduleService = new ModuleService(config)
        await moduleService.createService(moduleName, name, isServer)

        // Success message
        logSuccess(`Service '${name}' created successfully in module '${moduleName}'!`)
        console.log('')
        console.log(chalk.cyan('Service Details:'))
        console.log(`  Name: ${chalk.green(name)}`)
        console.log(`  Module: ${chalk.green(moduleName)}`)
        console.log(`  Type: ${chalk.green(isServer ? 'Server-side' : 'Client-side')}`)
        console.log(`  API Templates: ${chalk.green(serviceOptions.api ? 'Yes' : 'No')}`)
        console.log(`  Test: ${chalk.green(serviceOptions.test ? 'Yes' : 'No')}`)
        console.log('')
        console.log(chalk.cyan('Next steps:'))
        console.log(`  1. Implement service logic in the generated file`)
        console.log(`  2. Add service methods and business logic`)
        if (serviceOptions.test) {
          console.log(`  3. Write tests for your service functionality`)
        }
        
      } catch (error) {
        logError(`Failed to create service: ${(error as Error).message}`)
      }
    })
}

