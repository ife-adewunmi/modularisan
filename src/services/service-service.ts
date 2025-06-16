import path from "path"
import fs from "fs-extra"
import { renderTemplate } from "../utils/template"
import { ensureDirectoryExists } from "../utils/file"

interface CreateServiceOptions {
  name: string
  path: string
  isServerAction: boolean
  withTest: boolean
  withTypes: boolean
  withDb: boolean
}

export class ServiceService {
  async createService(options: CreateServiceOptions): Promise<void> {
    const { name, path: basePath, isServerAction, withTest, withTypes, withDb } = options

    // Create the service directory if it doesn't exist
    const serviceDir = path.join(process.cwd(), basePath)
    await ensureDirectoryExists(serviceDir)

    // Create service file
    const serviceContent = await renderTemplate("service/service.ejs", {
      name,
      isServerAction,
      withTypes,
      withDb,
    })

    await fs.writeFile(path.join(serviceDir, `${name}.ts`), serviceContent)

    // Create test file if requested
    if (withTest) {
      const testContent = await renderTemplate("service/test.ejs", { name })

      // Create __tests__ directory if it doesn't exist
      const testDir = path.join(serviceDir, "__tests__")
      await ensureDirectoryExists(testDir)

      await fs.writeFile(path.join(testDir, `${name}.test.ts`), testContent)
    }
  }
}
