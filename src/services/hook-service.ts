import path from "path"
import fs from "fs-extra"
import { renderTemplate } from "../utils/template"
import { ensureDirectoryExists } from "../utils/file"

interface CreateHookOptions {
  name: string
  path: string
  withTest: boolean
  withTypes: boolean
  reactHooks: string[]
}

export class HookService {
  async createHook(options: CreateHookOptions): Promise<void> {
    const { name, path: basePath, withTest, withTypes, reactHooks } = options

    // Create the hooks directory if it doesn't exist
    const hooksDir = path.join(process.cwd(), basePath)
    await ensureDirectoryExists(hooksDir)

    // Create hook file
    const hookContent = await renderTemplate("hook/hook.ejs", {
      name,
      withTypes,
      reactHooks,
    })

    await fs.writeFile(path.join(hooksDir, `${name}.ts`), hookContent)

    // Create test file if requested
    if (withTest) {
      const testContent = await renderTemplate("hook/test.ejs", { name })

      // Create __tests__ directory if it doesn't exist
      const testDir = path.join(hooksDir, "__tests__")
      await ensureDirectoryExists(testDir)

      await fs.writeFile(path.join(testDir, `${name}.test.ts`), testContent)
    }
  }
}
