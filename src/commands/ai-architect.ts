import type { Command } from 'commander'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import path from 'path'
import { ConfigManager } from '../core/config-manager'
import { AIService } from '../core/ai-service'
import { ModuleService } from '../core/module-service'
import { logSuccess, logError, logInfo } from '../utils/logger'
import chalk from 'chalk'

export function aiArchitectCommand(program: Command): void {
  program
    .command('ai:architect [requirements]')
    .description('Get AI-powered architecture suggestions')
    .option('-o, --output <path>', 'Output file path for generated architecture')
    .option('--create-modules', 'Create suggested modules automatically')
    .option('--format <format>', 'Output format (markdown, json, yaml)', 'markdown')
    .option('--interactive', 'Interactive mode for detailed requirements')
    .action(async (requirements, options) => {
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

        // Check if AI is enabled
        if (!config.ai?.enabled) {
          logError('AI is not enabled. Enable it with: misan config set ai.enabled true')
          return
        }

        // Initialize AI service
        const aiService = new AIService(config)
        
        if (!aiService.isEnabled()) {
          logError('AI service is not properly configured. Please check your configuration.')
          return
        }

        let projectRequirements = requirements

        // Interactive mode for detailed requirements
        if (options.interactive || !projectRequirements) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'projectName',
              message: 'What is your project name?',
              default: config.project.name || 'my-project'
            },
            {
              type: 'textarea',
              name: 'description',
              message: 'Describe your project requirements:',
              when: () => !projectRequirements,
              validate: (input) => {
                if (!input) return 'Project description is required'
                return true
              }
            },
            {
              type: 'checkbox',
              name: 'features',
              message: 'What features will your project need?',
              choices: [
                { name: 'User Authentication', value: 'auth' },
                { name: 'Dashboard/Admin Panel', value: 'dashboard' },
                { name: 'API Integration', value: 'api' },
                { name: 'Database Operations', value: 'database' },
                { name: 'Real-time Features', value: 'realtime' },
                { name: 'File Upload/Management', value: 'files' },
                { name: 'Payment Processing', value: 'payments' },
                { name: 'Notifications', value: 'notifications' },
                { name: 'Search Functionality', value: 'search' },
                { name: 'Analytics/Reporting', value: 'analytics' },
                { name: 'Multi-language Support', value: 'i18n' },
                { name: 'Mobile Support', value: 'mobile' }
              ]
            },
            {
              type: 'list',
              name: 'scale',
              message: 'What is the expected scale of your project?',
              choices: [
                { name: 'Small (1-5 developers, simple features)', value: 'small' },
                { name: 'Medium (5-15 developers, moderate complexity)', value: 'medium' },
                { name: 'Large (15+ developers, complex features)', value: 'large' },
                { name: 'Enterprise (Multiple teams, high complexity)', value: 'enterprise' }
              ]
            },
            {
              type: 'checkbox',
              name: 'constraints',
              message: 'Any specific constraints or preferences?',
              choices: [
                { name: 'Performance Critical', value: 'performance' },
                { name: 'High Security Requirements', value: 'security' },
                { name: 'Easy Maintenance', value: 'maintainability' },
                { name: 'Rapid Development', value: 'speed' },
                { name: 'Scalability', value: 'scalability' },
                { name: 'Cost Efficiency', value: 'cost' }
              ]
            }
          ])

          projectRequirements = `
Project: ${answers.projectName}
Description: ${answers.description || projectRequirements}
Features: ${answers.features.join(', ')}
Scale: ${answers.scale}
Constraints: ${answers.constraints.join(', ')}
Framework: ${config.framework.name}
`
        }

        logInfo('Analyzing requirements and generating architecture suggestions...')
        
        // Get AI architecture suggestions
        const suggestions = await aiService.suggestArchitecture(projectRequirements)
        
        // Display suggestions
        console.log('\\n' + chalk.cyan('🏗️  AI Architecture Suggestions'))
        console.log('=' + '='.repeat(50))
        
        console.log(`\\n${chalk.bold('Recommended Modules:')}`)
        suggestions.modules.forEach((module, index) => {
          console.log(`  ${index + 1}. ${chalk.green(module)}`)
        })
        
        console.log(`\\n${chalk.bold('Key Dependencies:')}`)
        suggestions.dependencies.forEach((dep, index) => {
          console.log(`  ${index + 1}. ${chalk.blue(dep)}`)
        })
        
        console.log(`\\n${chalk.bold('Architecture Recommendations:')}`)
        suggestions.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`)
        })
        
        console.log(`\\n${chalk.bold('Reasoning:')}`)
        console.log(`${chalk.gray(suggestions.reasoning)}`)
        
        // Save output if requested
        if (options.output) {
          let outputContent = ''
          
          if (options.format === 'json') {
            outputContent = JSON.stringify({
              requirements: projectRequirements,
              suggestions: suggestions,
              generatedAt: new Date().toISOString(),
              framework: config.framework.name
            }, null, 2)
          } else if (options.format === 'yaml') {
            outputContent = `# Architecture Suggestions
# Generated: ${new Date().toLocaleString()}
# Framework: ${config.framework.name}

modules:
${suggestions.modules.map(m => `  - ${m}`).join('\\n')}

dependencies:
${suggestions.dependencies.map(d => `  - ${d}`).join('\\n')}

recommendations:
${suggestions.recommendations.map(r => `  - ${r}`).join('\\n')}

reasoning: |
  ${suggestions.reasoning}
`
          } else {
            // Markdown format
            outputContent = `# Architecture Suggestions

**Generated:** ${new Date().toLocaleString()}  
**Framework:** ${config.framework.name}

## Requirements
${projectRequirements}

## Recommended Modules
${suggestions.modules.map(m => `- ${m}`).join('\\n')}

## Key Dependencies
${suggestions.dependencies.map(d => `- ${d}`).join('\\n')}

## Architecture Recommendations
${suggestions.recommendations.map(r => `- ${r}`).join('\\n')}

## Reasoning
${suggestions.reasoning}

---
*Generated by Modularisan AI*`
          }
          
          await fs.writeFile(options.output, outputContent, 'utf-8')
          logSuccess(`Architecture suggestions saved to: ${options.output}`)
        }
        
        // Offer to create modules automatically
        if (options.createModules) {
          const { confirmCreate } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmCreate',
              message: 'Would you like to create the suggested modules automatically?',
              default: false
            }
          ])
          
          if (confirmCreate) {
            const moduleService = new ModuleService(config)
            
            for (const moduleName of suggestions.modules) {
              try {
                logInfo(`Creating module: ${moduleName}`)
                await moduleService.createModule({
                  name: moduleName,
                  description: `AI-generated module for ${moduleName}`,
                  template: 'basic'
                })
                logSuccess(`✅ Module '${moduleName}' created successfully`)
              } catch (error) {
                logError(`❌ Failed to create module '${moduleName}': ${(error as Error).message}`)
              }
            }
            
            logSuccess('All suggested modules have been processed!')
          }
        }
        
        // Show next steps
        console.log('\\n' + chalk.cyan('🚀 Next Steps:'))
        console.log('1. Review the suggested architecture')
        console.log('2. Create modules manually or use --create-modules flag')
        console.log('3. Install recommended dependencies')
        console.log('4. Start implementing your features')
        
      } catch (error) {
        logError(`Architecture analysis failed: ${(error as Error).message}`)
      }
    })
}
