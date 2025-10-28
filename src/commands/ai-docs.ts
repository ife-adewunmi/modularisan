import * as path from 'path';

import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import type { Command } from 'commander';

import { AIService } from '@/core/ai-service';
import { ConfigManager } from '@/core/config-manager';
import { logSuccess, logError, logInfo } from '@/utils/logger';

export function aiDocsCommand(program: Command): void {
  program
    .command('ai:docs [file]')
    .description('Generate documentation using AI')
    .option('-t, --type <type>', 'Code type (component, service, module)')
    .option('-o, --output <path>', 'Output file path')
    .option(
      '--format <format>',
      'Output format (markdown, html, json)',
      'markdown'
    )
    .option('--overwrite', 'Overwrite existing documentation')
    .option('--preview', 'Preview documentation without saving')
    .action(async (file, options) => {
      try {
        // Load configuration
        const configManager = new ConfigManager();
        let config;

        try {
          config = await configManager.loadConfig();
        } catch (error) {
          logError(
            `No configuration found. Please run "misan init" first: ${(error as Error).message}`
          );
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
          const { selectedFile } = await inquirer.prompt([
            {
              type: 'input',
              name: 'selectedFile',
              message: 'Enter the path to the file you want to document:',
              validate: (input) => {
                if (!input) return 'File path is required';
                if (!fs.existsSync(input)) return 'File does not exist';
                return true;
              },
            },
          ]);
          targetFile = selectedFile;
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
            const { detectedType } = await inquirer.prompt([
              {
                type: 'list',
                name: 'detectedType',
                message: 'What type of code is this?',
                choices: [
                  { name: 'Component', value: 'component' },
                  { name: 'Service', value: 'service' },
                  { name: 'Hook', value: 'hook' },
                  { name: 'Utility', value: 'utility' },
                  { name: 'Module', value: 'module' },
                  { name: 'Other', value: 'other' },
                ],
              },
            ]);
            codeType = detectedType;
          }
        }

        // Read the file
        const fileContent = await fs.readFile(targetFile, 'utf-8');

        logInfo(`Generating documentation for ${targetFile} using AI...`);

        // Generate documentation
        const documentation = await aiService.generateDocumentation(
          fileContent,
          codeType
        );

        // Preview mode
        if (options.preview) {
          console.log(
            '\\n' + chalk.cyan('🤖 AI Generated Documentation Preview')
          );
          console.log('=' + '='.repeat(50));
          console.log(documentation);
          console.log('=' + '='.repeat(50));
          return;
        }

        // Determine output file path
        let outputPath = options.output;
        if (!outputPath) {
          const fileDir = path.dirname(targetFile);
          const fileName = path.basename(targetFile, path.extname(targetFile));
          const extension =
            options.format === 'html'
              ? '.html'
              : options.format === 'json'
                ? '.json'
                : '.md';
          outputPath = path.join(fileDir, `${fileName}.docs${extension}`);
        }

        // Check if file exists and ask for confirmation
        if ((await fs.pathExists(outputPath)) && !options.overwrite) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Documentation file already exists at ${outputPath}. Overwrite?`,
              default: false,
            },
          ]);

          if (!confirm) {
            logInfo('Documentation generation cancelled.');
            return;
          }
        }

        // Format and save documentation
        let formattedDocs = documentation;

        if (options.format === 'json') {
          formattedDocs = JSON.stringify(
            {
              file: targetFile,
              type: codeType,
              documentation: documentation,
              generatedAt: new Date().toISOString(),
            },
            null,
            2
          );
        } else if (options.format === 'html') {
          formattedDocs = `<!DOCTYPE html>
<html>
<head>
    <title>Documentation for ${path.basename(targetFile)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 2px; }
        h1, h2, h3 { color: #333; }
    </style>
</head>
<body>
    <h1>Documentation for ${path.basename(targetFile)}</h1>
    <p><strong>Type:</strong> ${codeType}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <hr>
    <div>${documentation.replace(/\\n/g, '<br>')}</div>
</body>
</html>`;
        } else {
          // Markdown format
          formattedDocs = `# Documentation for ${path.basename(targetFile)}

**Type:** ${codeType}  
**Generated:** ${new Date().toLocaleString()}

---

${documentation}

---

*Generated by Modularisan AI*`;
        }

        // Save documentation
        await fs.writeFile(outputPath, formattedDocs, 'utf-8');

        logSuccess(`Documentation generated and saved to: ${outputPath}`);

        // Show preview
        console.log('\\n' + chalk.cyan('📄 Generated Documentation Preview:'));
        console.log(chalk.gray(documentation.substring(0, 200) + '...'));
      } catch (error) {
        logError(
          `Documentation generation failed: ${(error as Error).message}`
        );
      }
    });
}
