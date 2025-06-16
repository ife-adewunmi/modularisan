#!/usr/bin/env node

import { Command } from 'commander'
import figlet from 'figlet'
import chalk from 'chalk'
import { initCommand } from './commands/init'
import { createModuleCommand } from './commands/create-module'
import { createComponentCommand } from './commands/create-component'
import { createServiceCommand } from './commands/create-service'
import { listCommand } from './commands/list'
import { generateCommand } from './commands/generate'
import { debugCommand } from './commands/debug'
import { configCommand } from './commands/config'
import { migrateCommand } from './commands/migrate'

// Display banner
console.log(chalk.cyan(figlet.textSync('Modularisan', { horizontalLayout: 'full' })))
console.log(chalk.cyan('Framework-agnostic modular code generator\n'))

const program = new Command()

program
  .version('2.0.0')
  .description('A framework-agnostic CLI tool for generating modular, scalable code structures')

// Register commands
initCommand(program)
createModuleCommand(program)
createComponentCommand(program)
createServiceCommand(program)
listCommand(program)
generateCommand(program)
configCommand(program)
migrateCommand(program)
debugCommand(program)

// Add help text
program.on('--help', () => {
  console.log('')
  console.log('Examples:')
  console.log('  $ misan init                                    # Initialize project configuration')
  console.log('  $ misan create:module user-management           # Create a new module')
  console.log('  $ misan create:component login-form user        # Create component in user module')
  console.log('  $ misan create:service user-service user        # Create service in user module')
  console.log('  $ misan list modules                           # List all modules')
  console.log('  $ misan generate component --ai                # AI-assisted component generation')
  console.log('  $ misan config set features.standalone true    # Update configuration')
  console.log('  $ misan migrate from-nextisan                  # Migrate from legacy Nextisan')
  console.log('  $ misan debug                                  # Debug project setup')
  console.log('')
  console.log('Supported Frameworks:')
  console.log('  Frontend: React, Vue.js, Svelte, Angular')
  console.log('  Backend: Nest.js, Express.js')
  console.log('  Fullstack: Next.js, Nuxt.js')
  console.log('')
  console.log('For more information, visit: https://github.com/ife-adewunmi/modularisan')
})

program.parse(process.argv)

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
