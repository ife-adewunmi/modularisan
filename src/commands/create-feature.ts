import type { Command } from "commander"
import inquirer from "inquirer"
import { FeatureService } from "../services/feature-service"
import { validateName } from "../utils/validators"
import { logSuccess, logError, logInfo } from "../utils/logger"
import chalk from "chalk"

export function createFeatureCommand(program: Command): void {
  program
    .command("create:feature [name]")
    .description("Create a new feature folder with optional components")
    .option("-p, --path <path>", "Path where the feature folder will be created", "src/features")
    .option("-c, --components", "Include components folder", true)
    .option("-h, --hooks", "Include hooks folder", true)
    .option("-s, --services", "Include services folder", true)
    .option("-t, --types", "Include types folder", true)
    .option("--tests", "Include tests folder", true)
    .option("-d, --directory <dir>", "Project root directory", process.cwd())
    .option("--page", "Create a page file for the feature", true)
    .action(async (name, options) => {
      try {
        // If name is not provided, prompt for it
        if (!name) {
          const answers = await inquirer.prompt([
            {
              type: "input",
              name: "name",
              message: "What is the name of the feature?",
              validate: (input) => {
                if (!input) return "Feature name is required"
                if (!validateName(input)) return "Invalid feature name. Use kebab-case (e.g., user-profile)"
                return true
              },
            },
          ])
          name = answers.name
        } else if (!validateName(name)) {
          logError("Invalid feature name. Use kebab-case (e.g., user-profile)")
          return
        }

        // If options are not explicitly set, prompt for them
        if (process.argv.length <= 3) {
          logInfo("Interactive mode: Select which folders to include")

          const answers = await inquirer.prompt([
            {
              type: "checkbox",
              name: "components",
              message: "Select components to include:",
              choices: [
                { name: "Components folder", value: "components", checked: options.components },
                { name: "Hooks folder", value: "hooks", checked: options.hooks },
                { name: "Services folder", value: "services", checked: options.services },
                { name: "Types folder", value: "types", checked: options.types },
                { name: "Tests folder", value: "tests", checked: options.tests },
              ],
            },
            {
              type: "confirm",
              name: "createIndex",
              message: "Create index.ts file?",
              default: true,
            },
            {
              type: "confirm",
              name: "createPage",
              message: "Create a page file for this feature?",
              default: options.page,
            },
            {
              type: "input",
              name: "componentName",
              message: "Enter a component name to create (leave empty to skip):",
              validate: (input) => {
                if (!input) return true
                return validateName(input) ? true : "Invalid component name. Use kebab-case (e.g., login-form)"
              },
            },
          ])

          const featureService = new FeatureService()

          // Create the feature folder and components
          await featureService.createFeature({
            name,
            path: options.path,
            components: answers.components,
            createIndex: answers.createIndex,
            componentName: answers.componentName,
            createPage: answers.createPage,
            rootDir: options.directory,
          })
        } else {
          // Use command line options
          const featureService = new FeatureService()

          const components = []
          if (options.components) components.push("components")
          if (options.hooks) components.push("hooks")
          if (options.services) components.push("services")
          if (options.types) components.push("types")
          if (options.tests) components.push("tests")

          await featureService.createFeature({
            name,
            path: options.path,
            components,
            createIndex: true,
            createPage: options.page,
            rootDir: options.directory,
          })
        }

        logSuccess(`Feature '${name}' created successfully!`)

        // Show next steps
        console.log("\n" + chalk.cyan("Next steps:"))
        console.log(chalk.cyan("  1.") + " Add more components to your feature:")
        console.log(
          `     ${chalk.green("nextisan create:component")} ${chalk.yellow("<component-name>")} ${chalk.green("--path=")}${chalk.yellow(`src/features/${name}/components`)}`,
        )
        console.log(chalk.cyan("  2.") + " Add services for data fetching:")
        console.log(
          `     ${chalk.green("nextisan create:service")} ${chalk.yellow("<service-name>")} ${chalk.green("--path=")}${chalk.yellow(`src/features/${name}/services`)}`,
        )
        console.log(chalk.cyan("  3.") + " Create a custom hook:")
        console.log(
          `     ${chalk.green("nextisan create:hook")} ${chalk.yellow(`use-${name}`)} ${chalk.green("--path=")}${chalk.yellow(`src/features/${name}/hooks`)}`,
        )
      } catch (error) {
        logError(`Failed to create feature: ${(error as Error).message}`)
      }
    })
}
