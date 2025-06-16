import type { Command } from "commander"
import inquirer from "inquirer"
import { PageService } from "../services/page-service"
import { validateName } from "../utils/validators"
import { logSuccess, logError } from "../utils/logger"

export function createPageCommand(program: Command): void {
  program
    .command("create:page <name>")
    .description("Create a new Next.js page")
    .option("-p, --path <path>", "Path where the page will be created", "src/app")
    .option("-l, --layout", "Create a layout file", false)
    .option("-r, --route-group", "Create as a route group", false)
    .action(async (name, options) => {
      try {
        // Validate page name
        if (!validateName(name)) {
          logError("Invalid page name. Use kebab-case (e.g., user-profile)")
          return
        }

        // Ask for additional options
        const answers = await inquirer.prompt([
          {
            type: "confirm",
            name: "createLoading",
            message: "Create a loading.tsx file?",
            default: false,
          },
          {
            type: "confirm",
            name: "createError",
            message: "Create an error.tsx file?",
            default: false,
          },
          {
            type: "confirm",
            name: "createMetadata",
            message: "Include metadata?",
            default: true,
          },
          {
            type: "confirm",
            name: "isDynamic",
            message: "Is this a dynamic route?",
            default: false,
          },
          {
            type: "input",
            name: "dynamicParam",
            message: "Enter dynamic parameter name:",
            default: "id",
            when: (answers: any) => answers.isDynamic,
          },
        ])

        const pageService = new PageService()

        // Create the page
        await pageService.createPage({
          name,
          path: options.path,
          createLayout: options.layout,
          createLoading: answers.createLoading,
          createError: answers.createError,
          createMetadata: answers.createMetadata,
          isDynamic: answers.isDynamic,
          dynamicParam: answers.dynamicParam,
          isRouteGroup: options.routeGroup,
        })

        logSuccess(`Page '${name}' created successfully!`)
      } catch (error) {
        logError(`Failed to create page: ${(error as Error).message}`)
      }
    })
}
