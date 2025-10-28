# Configuration Guide

Complete guide to configuring Modularisan for your project needs.

## 📄 Configuration File

Modularisan uses a `modularisan.config.yml` file in your project root. This file is automatically created when you run `misan init`.

### Basic Structure

```yaml
version: "2.0.0"
framework:
  name: "Next.js"
  type: "fullstack"
  version: "^14.0.0"
project:
  name: "my-app"
  rootDir: "/path/to/project"
  packageManager: "npm"
paths:
  modules: "src/modules"
  shared: "src/shared"
  tests: "__tests__"
features:
  typescript: true
  testing: true
  standalone_modules: false
  package_per_module: false
conventions:
  naming: "kebab-case"
  file_extensions:
    component: ".tsx"
    service: ".ts"
    test: ".test.ts"
templates:
  component: "component"
  service: "service"
  module: "feature"
  test: "test"
ai:
  enabled: false
  provider: "openai"
  model: "gpt-4"
```

## 🔧 Configuration Sections

### Framework Configuration

```yaml
framework:
  name: "Next.js"           # Framework name
  type: "fullstack"         # Framework type: frontend, backend, fullstack
  version: "^14.0.0"        # Framework version
  features:                 # Framework-specific features
    api: true              # API route support
    ssr: true              # Server-side rendering
    ssg: true              # Static site generation
    routing: true          # Built-in routing
```

**Supported Frameworks:**
- **Next.js** - `name: "Next.js"`, `type: "fullstack"`
- **React** - `name: "React"`, `type: "frontend"`
- **Vue.js** - `name: "Vue.js"`, `type: "frontend"`
- **Angular** - `name: "Angular"`, `type: "frontend"`
- **Svelte** - `name: "Svelte"`, `type: "frontend"`
- **Nuxt.js** - `name: "Nuxt.js"`, `type: "fullstack"`
- **Nest.js** - `name: "Nest.js"`, `type: "backend"`
- **Express.js** - `name: "Express.js"`, `type: "backend"`

### Project Configuration

```yaml
project:
  name: "my-awesome-app"     # Project name
  rootDir: "/path/to/project" # Project root directory
  packageManager: "npm"       # Package manager: npm, yarn, pnpm
  description: "Project description"
  author: "Your Name"
  license: "MIT"
```

### Path Configuration

```yaml
paths:
  modules: "src/modules"      # Module directory
  shared: "src/shared"        # Shared utilities directory
  tests: "__tests__"          # Test directory
  components: "components"    # Component subdirectory in modules
  services: "services"        # Service subdirectory in modules
  types: "types"             # Types subdirectory in modules
  hooks: "hooks"             # Hooks subdirectory in modules
  utils: "utils"             # Utils subdirectory in modules
  api: "api"                 # API subdirectory in modules
  pages: "pages"             # Pages subdirectory in modules
```

### Feature Configuration

```yaml
features:
  typescript: true               # Enable TypeScript support
  testing: true                  # Enable testing setup
  standalone_modules: false      # Create standalone modules
  package_per_module: false     # Create package.json per module
  storybook: false              # Enable Storybook integration
  eslint: true                  # Enable ESLint integration
  prettier: true                # Enable Prettier integration
  tailwind: false               # Enable Tailwind CSS
  sass: false                   # Enable SASS/SCSS support
  css_modules: false            # Enable CSS modules
```

### Naming Conventions

```yaml
conventions:
  naming: "kebab-case"           # Naming convention: kebab-case, camelCase, snake_case
  file_extensions:
    component: ".tsx"            # Component file extension
    service: ".ts"               # Service file extension
    type: ".ts"                  # Type file extension
    test: ".test.ts"             # Test file extension
    story: ".stories.tsx"        # Storybook story extension
    style: ".module.scss"        # Style file extension
  prefixes:
    component: ""                # Component file prefix
    service: ""                  # Service file prefix
    hook: "use-"                 # Hook prefix
    type: ""                     # Type file prefix
```

### Template Configuration

```yaml
templates:
  component: "component"         # Component template directory
  service: "service"             # Service template directory
  module: "feature"              # Module template directory
  test: "test"                   # Test template directory
  hook: "hook"                   # Hook template directory
  type: "type"                   # Type template directory
  api: "api"                     # API template directory
  page: "page"                   # Page template directory
```

### AI Configuration

```yaml
ai:
  enabled: false                 # Enable AI features
  provider: "openai"             # AI provider: openai, anthropic, cohere
  model: "gpt-4"                 # AI model
  temperature: 0.7               # AI creativity level
  max_tokens: 2048               # Maximum tokens per request
  timeout: 30000                 # Request timeout in milliseconds
  api_key_env: "OPENAI_API_KEY"  # Environment variable for API key
```

## 🛠️ Managing Configuration

### View Configuration

```bash
# Show full configuration
misan config show

# Show specific section
misan config show framework
misan config show paths
```

### Update Configuration

```bash
# Set single value
misan config set features.typescript true
misan config set paths.modules "src/features"

# Set nested values
misan config set framework.name "React"
misan config set ai.enabled true
misan config set ai.provider "openai"
```

### Get Configuration Values

```bash
# Get specific value
misan config get framework.name
misan config get features.typescript
misan config get paths.modules
```

### Edit Configuration File

```bash
# Open in default editor
misan config edit

# Open in specific editor
EDITOR=code misan config edit
```

### Validate Configuration

```bash
# Validate configuration file
misan config validate

# Validate with verbose output
misan config validate --verbose
```

## 📋 Framework-Specific Configuration

### Next.js Configuration

```yaml
framework:
  name: "Next.js"
  type: "fullstack"
  version: "^14.0.0"
  features:
    api: true
    ssr: true
    ssg: true
    app_router: true
    pages_router: false
    turbo: true
    
paths:
  modules: "src/modules"
  shared: "src/shared"
  app: "src/app"
  pages: "src/pages"
  api: "src/app/api"
  
conventions:
  file_extensions:
    component: ".tsx"
    page: ".tsx"
    layout: ".tsx"
    api: ".ts"
```

### React Configuration

```yaml
framework:
  name: "React"
  type: "frontend"
  version: "^18.0.0"
  features:
    hooks: true
    context: true
    suspense: true
    concurrent: true
    
conventions:
  file_extensions:
    component: ".jsx"
    hook: ".js"
    context: ".js"
    
features:
  css_modules: true
  styled_components: false
  emotion: false
```

### Vue.js Configuration

```yaml
framework:
  name: "Vue.js"
  type: "frontend"
  version: "^3.0.0"
  features:
    composition_api: true
    script_setup: true
    typescript: true
    
conventions:
  file_extensions:
    component: ".vue"
    composable: ".js"
    
features:
  pinia: true
  vuex: false
```

### Angular Configuration

```yaml
framework:
  name: "Angular"
  type: "frontend"
  version: "^17.0.0"
  features:
    standalone: true
    signals: true
    ssr: true
    
conventions:
  file_extensions:
    component: ".component.ts"
    service: ".service.ts"
    module: ".module.ts"
    
features:
  ngrx: false
  rxjs: true
```

## 🎯 Module Templates

Configure different module templates for different use cases:

```yaml
module_templates:
  basic:
    components: ["components", "services", "types"]
    description: "Basic module with essential directories"
    
  full:
    components: ["components", "services", "types", "hooks", "utils", "tests"]
    description: "Complete module with all features"
    
  api:
    components: ["services", "types", "controllers", "middleware"]
    description: "Backend-focused module"
    
  ui:
    components: ["components", "hooks", "types", "styles"]
    description: "Frontend-focused module"
    
  custom:
    components: ["components", "services", "types", "stores", "composables"]
    description: "Custom module template"
```

## 🔐 Environment Variables

Some configuration values can be set via environment variables:

```bash
# AI Configuration
export OPENAI_API_KEY="your-api-key"
export ANTHROPIC_API_KEY="your-api-key"

# Project Configuration
export MISAN_PROJECT_NAME="my-project"
export MISAN_PACKAGE_MANAGER="yarn"

# Path Configuration
export MISAN_MODULES_PATH="src/features"
export MISAN_SHARED_PATH="src/shared"

# Feature Flags
export MISAN_TYPESCRIPT=true
export MISAN_TESTING=true
export MISAN_AI_ENABLED=false
```

## 📊 Configuration Validation

Modularisan validates your configuration to ensure everything is set up correctly:

```bash
# Validate configuration
misan config validate

# Example validation output
✓ Configuration file exists
✓ Valid YAML syntax
✓ Required fields present
✓ Framework configuration valid
✓ Paths exist and are writable
✓ Feature flags valid
✓ Template configuration valid
⚠ AI configuration incomplete (API key missing)
```

## 🔄 Configuration Migration

When upgrading Modularisan, you might need to migrate your configuration:

```bash
# Migrate configuration to latest version
misan config migrate

# Backup current configuration
misan config backup

# Restore from backup
misan config restore
```

## 📝 Configuration Examples

### Minimalist Configuration

```yaml
version: "2.0.0"
framework:
  name: "React"
  type: "frontend"
project:
  name: "simple-app"
  rootDir: "."
features:
  typescript: true
```

### Enterprise Configuration

```yaml
version: "2.0.0"
framework:
  name: "Next.js"
  type: "fullstack"
  version: "^14.0.0"
project:
  name: "enterprise-app"
  rootDir: "."
  packageManager: "pnpm"
  description: "Enterprise application"
  author: "Development Team"
paths:
  modules: "src/modules"
  shared: "src/shared"
  tests: "__tests__"
  components: "components"
  services: "services"
  types: "types"
  hooks: "hooks"
  utils: "utils"
features:
  typescript: true
  testing: true
  standalone_modules: true
  package_per_module: true
  storybook: true
  eslint: true
  prettier: true
  tailwind: true
conventions:
  naming: "kebab-case"
  file_extensions:
    component: ".tsx"
    service: ".ts"
    test: ".test.ts"
ai:
  enabled: true
  provider: "openai"
  model: "gpt-4"
  temperature: 0.5
```

### Monorepo Configuration

```yaml
version: "2.0.0"
framework:
  name: "Next.js"
  type: "fullstack"
project:
  name: "monorepo-app"
  rootDir: "."
paths:
  modules: "packages/modules"
  shared: "packages/shared"
  tests: "packages/tests"
features:
  typescript: true
  testing: true
  standalone_modules: true
  package_per_module: true
conventions:
  naming: "kebab-case"
  file_extensions:
    component: ".tsx"
    service: ".ts"
```

## 🚨 Common Configuration Issues

### Path Not Found
```bash
# Error: Module path does not exist
misan config set paths.modules "src/features"
# Solution: Ensure the directory exists or will be created
```

### Invalid Framework
```bash
# Error: Unsupported framework
misan config set framework.name "Unknown"
# Solution: Use a supported framework name
```

### Missing Required Fields
```bash
# Error: Required field missing
# Solution: Ensure all required fields are present
misan config validate
```

For more configuration help, use:
```bash
misan config --help
misan debug --verbose
```
