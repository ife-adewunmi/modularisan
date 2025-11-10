import * as path from 'path';

import * as chalk from 'chalk';
import type { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';

import { AIService } from '@/core/ai-service';
import { ConfigManager } from '@/core/config-manager';
import type { AiAnalyzeOptions } from '@/types/commands';
import { logSuccess, logError, logInfo } from '@/utils/logger';

interface FileSelectionAnswers {
  selectedFile: string;
}

interface TypeDetectionAnswers {
  detectedType: 'component' | 'service' | 'hook' | 'utility' | 'test' | 'other';
}

export function aiAnalyzeCommand(program: Command): void {
  program
    .command('ai:analyze [file]')
    .description('Analyze code using AI')
    .option('-t, --type <type>', 'Code type (component, service, module)')
    .option(
      '-f, --format <format>',
      'Output format (table, json, detailed)',
      'table'
    )
    .option('--fix', 'Show fix suggestions')
    .option('--metrics', 'Show detailed metrics')
    .action(async (file: string | undefined, options: AiAnalyzeOptions) => {
      try {
        // Load configuration
        const configManager = new ConfigManager();
        let config;

        try {
          config = await configManager.loadConfig();
        } catch {
          logError('No configuration found. Please run "misan init" first.');
          return;
        }

        // Check if AI is enabled
        if (!config.ai?.enabled) {
          logError(
            'AI is not enabled. Enable it with: misan config set ai.enabled true'
          );
          return;
        }

        // Initialize AI service
        const aiService = new AIService(config);

        if (!aiService.isEnabled()) {
          logError(
            'AI service is not properly configured. Please check your configuration.'
          );
          return;
        }

        let targetFile = file;
        let codeType = options.type;

        // Interactive file selection if not provided
        if (!targetFile) {
          const answers = await inquirer.prompt<FileSelectionAnswers>([
            {
              type: 'input',
              name: 'selectedFile',
              message: 'Enter the path to the file you want to analyze:',
              validate: (input: string) => {
                if (!input) return 'File path is required';
                if (!fs.existsSync(input)) return 'File does not exist';
                return true;
              },
            },
          ]);
          targetFile = answers.selectedFile;
        }

        // Auto-detect code type if not provided
        if (!codeType) {
          const fileExtension = path.extname(targetFile);
          const fileName = path.basename(targetFile, fileExtension);

          if (
            fileName.includes('.component') ||
            fileName.includes('Component')
          ) {
            codeType = 'component';
          } else if (
            fileName.includes('.service') ||
            fileName.includes('Service')
          ) {
            codeType = 'service';
          } else if (fileName.includes('.test') || fileName.includes('.spec')) {
            codeType = 'test';
          } else {
            const answers = await inquirer.prompt<TypeDetectionAnswers>([
              {
                type: 'list',
                name: 'detectedType',
                message: 'What type of code is this?',
                choices: [
                  { name: 'Component', value: 'component' },
                  { name: 'Service', value: 'service' },
                  { name: 'Hook', value: 'hook' },
                  { name: 'Utility', value: 'utility' },
                  { name: 'Test', value: 'test' },
                  { name: 'Other', value: 'other' },
                ],
              },
            ]);
            codeType = answers.detectedType;
          }
        }

        // Read the file
  const fileContent = await fs.readFile(targetFile, 'utf-8');

        logInfo(`Analyzing ${targetFile} using AI...`);

        // Analyze the code
        const analysis = await aiService.analyzeCode(fileContent, codeType);

        // Display results
        console.log('\n' + chalk.cyan('🤖 AI Code Analysis Results'));
        console.log('='.repeat(41));

        // Overall score
        const scoreColor =
          analysis.score >= 80
            ? 'green'
            : analysis.score >= 60
              ? 'yellow'
              : 'red';
        console.log(
          `\n${chalk.bold('Overall Score:')} ${chalk[scoreColor](analysis.score.toString())}/100`
        );

        // Metrics
        if (options.metrics) {
          console.log(`\n${chalk.bold('Detailed Metrics:')}`);
          console.log(`  Complexity: ${analysis.metrics.complexity}/10`);
          console.log(
            `  Maintainability: ${analysis.metrics.maintainability}/100`
          );
          console.log(`  Testability: ${analysis.metrics.testability}/100`);
          console.log(`  Performance: ${analysis.metrics.performance}/100`);
          console.log(`  Security: ${analysis.metrics.security}/100`);
        }

        // Issues
        if (analysis.issues.length > 0) {
          console.log(`\n${chalk.bold('Issues Found:')}`);
          analysis.issues.forEach((issue, index) => {
            const severityColor =
              issue.severity === 'high'
                ? 'red'
                : issue.severity === 'medium'
                  ? 'yellow'
                  : 'gray';
            const typeIcon =
              issue.type === 'error'
                ? '❌'
                : issue.type === 'warning'
                  ? '⚠️'
                  : '💡';

            console.log(
              `  ${index + 1}. ${typeIcon} ${chalk[severityColor](issue.message)}`
            );
            if (issue.line) {
              console.log(`     Line: ${issue.line}`);
            }
            if (options.fix && issue.fixSuggestion) {
              console.log(`     Fix: ${chalk.green(issue.fixSuggestion)}`);
            }
          });
        } else {
          console.log(`\n${chalk.green('✅ No issues found!')}`);
        }

        // Suggestions
        if (analysis.suggestions.length > 0) {
          console.log(`\n${chalk.bold('Improvement Suggestions:')}`);
          analysis.suggestions.forEach((suggestion, index) => {
            const impactColor =
              suggestion.impact === 'high'
                ? 'red'
                : suggestion.impact === 'medium'
                  ? 'yellow'
                  : 'green';
            const effortColor =
              suggestion.effort === 'low'
                ? 'green'
                : suggestion.effort === 'medium'
                  ? 'yellow'
                  : 'red';

            console.log(`  ${index + 1}. ${suggestion.message}`);
            console.log(
              `     Impact: ${chalk[impactColor](suggestion.impact)} | Effort: ${chalk[effortColor](suggestion.effort)}`
            );

            if (suggestion.code) {
              console.log(`     Example: ${chalk.gray(suggestion.code)}`);
            }
          });
        }

        // JSON output
        if (options.format === 'json') {
          console.log('\n' + chalk.cyan('JSON Output:'));
          console.log(JSON.stringify(analysis, null, 2));
        }

        logSuccess('Code analysis completed!');
      } catch (error) {
        logError(`Analysis failed: ${(error as Error).message}`);
      }
    });
}
