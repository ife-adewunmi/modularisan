#!/usr/bin/env node

import fs from "fs-extra"
import path from "path"
import chalk from "chalk"

// Define the base stubs directory
const stubsDir = path.join(__dirname, "..", "src", "stubs")

// Define the template files that should exist
const requiredTemplates = [
  "feature/index.ejs",
  "component/functional.ejs",
  "component/class.ejs",
  "component/style.ejs",
  "component/test.ejs",
  "component/story.ejs",
  "component/index.ejs",
  "service/service.ejs",
  "service/test.ejs",
  "hook/hook.ejs",
  "hook/test.ejs",
  "type/type.ejs",
  "test/jest.ejs",
  "test/vitest.ejs",
  "test/rtl.ejs",
  "test/mock.ejs",
  "page/page.ejs",
  "page/layout.ejs",
  "page/loading.ejs",
  "page/error.ejs",
  "api/route.ejs",
]

// Create basic template content for missing templates
const basicTemplates: { [key: string]: string } = {
  "feature/index.ejs": `// Export all components from this feature
export * from './components'
`,
  "component/functional.ejs": `<% if (isClientComponent) { %>
'use client'

<% } %>
import React from 'react'
<% if (withProps) { %>

interface <%= name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') %>Props {
  // Define your props here
}
<% } %>

export function <%= name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') %><% if (withProps) { %>(props: <%= name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') %>Props)<% } %> {
  return (
    <div>
      {/* Your component content here */}
    </div>
  )
}
`,
  "component/index.ejs": `export * from './<%= name %>'
`,
}

async function checkAndCreateStubs() {
  console.log(chalk.blue("Checking stubs directory structure..."))

  // Ensure the stubs directory exists
  await fs.ensureDir(stubsDir)

  let missingTemplates = 0

  // Check each required template
  for (const template of requiredTemplates) {
    const templatePath = path.join(stubsDir, template)
    const templateDir = path.dirname(templatePath)

    // Ensure the template directory exists
    await fs.ensureDir(templateDir)

    // Check if the template file exists
    if (!(await fs.pathExists(templatePath))) {
      console.log(chalk.yellow(`Missing template: ${template}`))
      missingTemplates++

      // Create the template file with basic content if available
      if (basicTemplates[template]) {
        await fs.writeFile(templatePath, basicTemplates[template])
        console.log(chalk.green(`Created template: ${template}`))
      } else {
        console.log(chalk.red(`No basic template available for: ${template}`))
      }
    }
  }

  if (missingTemplates === 0) {
    console.log(chalk.green("All template files exist!"))
  } else {
    console.log(chalk.yellow(`Created ${missingTemplates} missing template files.`))
    console.log(chalk.yellow("You may want to customize these templates with proper content."))
  }
}

checkAndCreateStubs().catch((error) => {
  console.error(chalk.red("Error checking stubs:"), error)
  process.exit(1)
})
