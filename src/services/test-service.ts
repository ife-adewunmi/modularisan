import path from "path"
import fs from "fs-extra"
import { renderTemplate } from "../utils/template"
import { ensureDirectoryExists } from "../utils/file"

interface CreateTestOptions {
  name: string
  path: string
  type: string
  testFramework: string
  withMocks: boolean
  testTarget: string
}

export class TestService {
  async createTest(options: CreateTestOptions): Promise<void> {
    const { name, path: basePath, type, testFramework, withMocks, testTarget } = options

    // Create the test directory if it doesn't exist
    const testDir = path.join(process.cwd(), basePath)
    await ensureDirectoryExists(testDir)

    // Determine template based on test type and framework
    let templateName = "test/jest.ejs"

    if (testFramework === "Vitest") {
      templateName = "test/vitest.ejs"
    } else if (testFramework === "React Testing Library") {
      templateName = "test/rtl.ejs"
    }

    // Create test file
    const testContent = await renderTemplate(templateName, {
      name,
      type,
      withMocks,
      testTarget,
    })

    const extension = testTarget === "component" ? ".test.tsx" : ".test.ts"

    await fs.writeFile(path.join(testDir, `${name}${extension}`), testContent)

    // Create mocks if requested
    if (withMocks) {
      const mocksDir = path.join(testDir, "__mocks__")
      await ensureDirectoryExists(mocksDir)

      const mockContent = await renderTemplate("test/mock.ejs", { name })
      await fs.writeFile(path.join(mocksDir, `${name}.ts`), mockContent)
    }
  }
}
