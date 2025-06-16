import path from "path"
import fs from "fs-extra"
import { renderTemplate } from "../utils/template"
import { ensureDirectoryExists } from "../utils/file"
import { logInfo, logError } from "../utils/logger"

interface CreateComponentOptions {
  name: string
  path: string
  type: string
  withStyle: boolean
  withProps: boolean
  withTest: boolean
  withStory: boolean
  isClientComponent: boolean
}

export class ComponentService {
  async createComponent(options: CreateComponentOptions): Promise<void> {
    const { name, path: basePath, type, withStyle, withProps, withTest, withStory, isClientComponent } = options

    try {
      // Create the component directory if it doesn't exist
      const componentDir = path.join(process.cwd(), basePath)
      await ensureDirectoryExists(componentDir)

      // Create component file
      try {
        const templateName = type === "class" ? "component/class.ejs" : "component/functional.ejs"
        const componentContent = await renderTemplate(templateName, {
          name,
          withProps,
          isClientComponent,
        })

        await fs.writeFile(path.join(componentDir, `${name}.tsx`), componentContent)
        logInfo(`Created component file: ${name}.tsx`)
      } catch (error) {
        logError(`Failed to create component file: ${(error as Error).message}`)

        // Create a fallback component file
        const pascalCaseName = name
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")

        const fallbackContent = `${isClientComponent ? "'use client'\n\n" : ""}import React from 'react'

${
  withProps
    ? `interface ${pascalCaseName}Props {
  // Define your props here
}

`
    : ""
}export function ${pascalCaseName}${withProps ? `(props: ${pascalCaseName}Props)` : ""} {
  return (
    <div>
      {/* Your component content here */}
    </div>
  )
}
`
        await fs.writeFile(path.join(componentDir, `${name}.tsx`), fallbackContent)
        logInfo(`Created fallback component file: ${name}.tsx`)
      }

      // Create style file if requested
      if (withStyle) {
        try {
          const styleContent = await renderTemplate("component/style.ejs", { name })
          await fs.writeFile(path.join(componentDir, `${name}.module.css`), styleContent)
          logInfo(`Created style file: ${name}.module.css`)
        } catch (error) {
          logError(`Failed to create style file: ${(error as Error).message}`)

          // Create a fallback style file
          const fallbackContent = `/* Styles for ${name} component */

.container {
  /* Your styles here */
}
`
          await fs.writeFile(path.join(componentDir, `${name}.module.css`), fallbackContent)
          logInfo(`Created fallback style file: ${name}.module.css`)
        }
      }

      // Create test file if requested
      if (withTest) {
        try {
          const testContent = await renderTemplate("component/test.ejs", { name })

          // Create __tests__ directory if it doesn't exist
          const testDir = path.join(componentDir, "__tests__")
          await ensureDirectoryExists(testDir)

          await fs.writeFile(path.join(testDir, `${name}.test.tsx`), testContent)
          logInfo(`Created test file: ${name}.test.tsx`)
        } catch (error) {
          logError(`Failed to create test file: ${(error as Error).message}`)
        }
      }

      // Create story file if requested
      if (withStory) {
        try {
          const storyContent = await renderTemplate("component/story.ejs", { name })
          await fs.writeFile(path.join(componentDir, `${name}.stories.tsx`), storyContent)
          logInfo(`Created story file: ${name}.stories.tsx`)
        } catch (error) {
          logError(`Failed to create story file: ${(error as Error).message}`)
        }
      }
    } catch (error) {
      throw new Error(`Failed to create component: ${(error as Error).message}`)
    }
  }
}
