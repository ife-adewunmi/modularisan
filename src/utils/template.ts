import ejs from "ejs"
import path from "path"
import fs from "fs-extra"

/**
 * Renders a template with the given data
 */
export async function renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
  try {
    // First try to find the template in the stubs directory
    const stubsPath = path.join(__dirname, "..", "stubs")

    // Construct the full template path
    const templatePath = path.join(stubsPath, `${templateName}`)

    // Check if the template file exists
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template file not found: ${templatePath}`)
    }

    // Read the template file
    const template = await fs.readFile(templatePath, "utf8")

    // Render the template with the provided data
    return ejs.render(template, data)
  } catch (error) {
    console.error(`Template rendering error:`, error)
    throw new Error(`Failed to render template: ${templateName}`)
  }
}
