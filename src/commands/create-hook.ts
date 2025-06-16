import type { Command } from "commander"
import inquirer from "inquirer"
import { HookService } from "../services/hook-service"
import { validateName } from "../utils/validators"
import { logSuccess, logError } from "../utils/logger"

export function createHookCommand(program: Command): void {
  program
    .command("create:hook <name>")
    .description("Create a new React hook")
    .option("-p, --path <path>", "Path where the hook will be created", "src/shared/hooks")
    .action(async (name, options) => {
      try {
        // Validate hook name
        if (!validateName(name)) {
          logError("Invalid hook name. Use kebab-case (e.g., use-auth)")
          return
        }

        // Ensure hook name starts with 'use-'
        if (!name.startsWith("use-")) {
          logError('Hook names should start with "use-" (e.g., use-auth)')
          return
        }

        // Ask for additional options
        const answers = await inquirer.prompt([
          {
            type: "confirm",
            name: "withTest",
            message: "Create a test file?",
            default: false,
          },
          {
            type: "confirm",
            name: "withTypes",
            message: "Include type definitions?",
            default: true,
          },
          {
            type: "checkbox",
            name: "reactHooks",
            message: "Select React hooks to import:",
            choices: [
              { name: "useState", value: "useState", checked: true },
              { name: "useEffect", value: "useEffect", checked: false },
              { name: "useCallback", value: "useCallback", checked: false },
              { name: "useMemo", value: "useMemo", checked: false },
              { name: "useRef", value: "useRef", checked: false },
              { name: "useContext", value: "useContext", checked: false },
            ],
          },
        ])

        const hookService = new HookService()

        // Create the hook
        await hookService.createHook({
          name,
          path: options.path,
          withTest: answers.withTest,
          withTypes: answers.withTypes,
          reactHooks: answers.reactHooks,
        })

        logSuccess(`Hook '${name}' created successfully!`)
      } catch (error) {
        logError(`Failed to create hook: ${(error as Error).message}`)
      }
    })
}
