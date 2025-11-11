import { Command } from 'commander';
import chalk from 'chalk';

import { getPresetsByCategory } from '@/core/presets-registry';
import { logInfo } from '@/utils/logger';

export function listPresetsCommand(program: Command): void {
  program
    .command('list:presets [category]')
    .alias('presets')
    .description('List available presets')
    .option('-v, --verbose', 'Show detailed information')
    .action((category: string | undefined, options: any) => {
      try {
        logInfo('Available Presets:');
        console.log();

        if (category) {
          // Show presets for specific category
          const presets = getPresetsByCategory(category as any);

          if (presets.length === 0) {
            console.log(
              chalk.yellow(`No presets found for category: ${category}`)
            );
            return;
          }

          console.log(chalk.cyan(`${category.toUpperCase()} PRESETS:`));
          console.log();

          presets.forEach((preset) => {
            console.log(chalk.bold(`  ${preset.name}`));
            console.log(chalk.gray(`    Key: ${preset.key}`));
            console.log(chalk.gray(`    ${preset.description}`));

            if (options.verbose) {
              console.log(chalk.gray(`    Features: ${preset.features.join(', ')}`));
              console.log(chalk.gray(`    Dependencies: ${preset.dependencies.length > 0 ? preset.dependencies.join(', ') : 'None'}`));
            }

            console.log();
          });
        } else {
          // Show all presets grouped by category
          const categories = ['authentication', 'api', 'forms', 'state', 'ui'];

          categories.forEach((cat) => {
            const presets = getPresetsByCategory(cat as any);

            if (presets.length === 0) return;

            console.log(chalk.cyan(`${cat.toUpperCase()}:`));
            console.log();

            presets.forEach((preset) => {
              console.log(chalk.bold(`  ${preset.name}`));
              console.log(chalk.gray(`    ${preset.description}`));

              if (options.verbose) {
                console.log(chalk.gray(`    Features: ${preset.features.join(', ')}`));
              }

              console.log();
            });
          });
        }

        console.log(chalk.dim('Use: misan presets <category> for category-specific presets'));
        console.log(chalk.dim('Use: misan create:module --preset <preset-key> to generate from preset'));
      } catch (error) {
        console.error(chalk.red(`Error listing presets: ${(error as Error).message}`));
      }
    });
}
