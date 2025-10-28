# Commands Reference

Complete reference for all Modularisan CLI commands.

## 📋 Command Structure

```bash
misan <command> [arguments] [options]
```

All commands support:
- `--help` - Show command help
- `--version` - Show version information

## 🚀 Project Commands

### `init`
Initialize Modularisan configuration in your project.

```bash
misan init [options]
```

**Options:**
- `-d, --directory <dir>` - Project root directory (default: current directory)
- `-f, --framework <framework>` - Force specific framework detection
- `-y, --yes` - Skip interactive prompts and use defaults
- `--typescript` - Enable TypeScript support
- `--testing` - Enable testing setup

**Examples:**
```bash
# Interactive initialization
misan init

# Skip prompts with defaults
misan init -y

# Force Next.js detection
misan init --framework=nextjs

# Initialize with TypeScript and testing
misan init --typescript --testing
```

### `config`
Manage project configuration.

```bash
misan config <action> [key] [value]
```

**Actions:**
- `show` - Display current configuration
- `get <key>` - Get specific configuration value
- `set <key> <value>` - Set configuration value
- `edit` - Open configuration file in editor
- `validate` - Validate configuration file

**Examples:**
```bash
# Show full configuration
misan config show

# Get specific value
misan config get framework.name

# Set configuration value
misan config set features.typescript true
misan config set paths.modules "src/features"

# Edit configuration file
misan config edit

# Validate configuration
misan config validate
```

### `debug`
Debug project setup and configuration.

```bash
misan debug [options]
```

**Options:**
- `--verbose` - Show detailed debug information
- `--check-templates` - Validate template files
- `--check-modules` - Validate existing modules

**Examples:**
```bash
# Basic debug info
misan debug

# Detailed debug information
misan debug --verbose

# Check template integrity
misan debug --check-templates
```

## 📦 Module Commands

### `create:module`
Create a new module.

```bash
misan create:module <name> [options]
```

**Arguments:**
- `<name>` - Module name (kebab-case)

**Options:**
- `-p, --path <path>` - Custom module path
- `-t, --template <template>` - Module template (basic, full, api, ui)
- `-d, --description <description>` - Module description
- `--components <components>` - Comma-separated list of components to include
- `--routing` - Include routing setup
- `--api` - Include API setup
- `--tests` - Include test setup
- `--standalone` - Create standalone module
- `--package-json` - Create package.json for module

**Templates:**
- `basic` - Components, services, types
- `full` - All features including hooks, utils, tests
- `api` - Backend-focused with controllers and middleware
- `ui` - Frontend-focused with components and styles

**Examples:**
```bash
# Basic module
misan create:module user-management

# Module with specific template
misan create:module payment-gateway --template=api

# Module with custom components
misan create:module dashboard --components=widgets,charts,metrics

# Standalone module with package.json
misan create:module auth --standalone --package-json

# Module with routing and API
misan create:module blog --routing --api
```

### `list`
List modules and their information.

```bash
misan list <type> [options]
```

**Types:**
- `modules` - List all modules
- `components` - List components in modules
- `services` - List services in modules

**Options:**
- `--detailed` - Show detailed information
- `--module <module>` - Filter by specific module
- `--format <format>` - Output format (table, json, yaml)

**Examples:**
```bash
# List all modules
misan list modules

# Detailed module listing
misan list modules --detailed

# List components in specific module
misan list components --module=user-management

# JSON output
misan list modules --format=json
```

## 🧩 Component Commands

### `create:component`
Create a new component in a module.

```bash
misan create:component <name> <module> [options]
```

**Arguments:**
- `<name>` - Component name (kebab-case)
- `<module>` - Target module name

**Options:**
- `-t, --type <type>` - Component type (functional, class, hook)
- `--props` - Include props interface
- `--client` - Create client component (Next.js)
- `--server` - Create server component (Next.js)
- `--story` - Create Storybook story
- `--test` - Create test file
- `--style` - Create style file

**Examples:**
```bash
# Basic functional component
misan create:component user-card user-management

# Component with props and story
misan create:component login-form auth --props --story

# Client component with test
misan create:component dashboard-widget dashboard --client --test

# Class component
misan create:component legacy-component shared --type=class
```

### `create:service`
Create a new service in a module.

```bash
misan create:service <name> <module> [options]
```

**Arguments:**
- `<name>` - Service name (kebab-case)
- `<module>` - Target module name

**Options:**
- `--server` - Create server-side service
- `--client` - Create client-side service
- `--api` - Include API integration
- `--test` - Create test file
- `--singleton` - Create singleton service
- `--injectable` - Create injectable service (Angular)

**Examples:**
```bash
# Basic service
misan create:service user-service user-management

# API service with tests
misan create:service api-service shared --api --test

# Server-side service
misan create:service auth-service auth --server

# Injectable service for Angular
misan create:service data-service shared --injectable
```

### `create:hook`
Create a custom hook (React/Vue).

```bash
misan create:hook <name> <module> [options]
```

**Arguments:**
- `<name>` - Hook name (use-* prefix optional)
- `<module>` - Target module name

**Options:**
- `--test` - Create test file
- `--dependencies <deps>` - Hook dependencies

**Examples:**
```bash
# Basic hook
misan create:hook use-user-data user-management

# Hook with test
misan create:hook user-auth auth --test

# Hook with dependencies
misan create:hook use-api shared --dependencies=axios,swr
```

### `create:type`
Create TypeScript type definitions.

```bash
misan create:type <name> <module> [options]
```

**Arguments:**
- `<name>` - Type name (kebab-case)
- `<module>` - Target module name

**Options:**
- `--interface` - Create interface
- `--type` - Create type alias
- `--enum` - Create enum
- `--export` - Export types

**Examples:**
```bash
# Create interface
misan create:type user-types user-management --interface

# Create multiple types
misan create:type api-types shared --interface --type --enum
```

### `create:test`
Create test files.

```bash
misan create:test <name> <module> [options]
```

**Arguments:**
- `<name>` - Test name
- `<module>` - Target module name

**Options:**
- `--type <type>` - Test type (unit, integration, component)
- `--framework <framework>` - Test framework (jest, vitest, cypress)

**Examples:**
```bash
# Unit test
misan create:test user-service user-management --type=unit

# Component test
misan create:test user-card user-management --type=component
```

### `create:api`
Create API endpoints.

```bash
misan create:api <name> <module> [options]
```

**Arguments:**
- `<name>` - API endpoint name
- `<module>` - Target module name

**Options:**
- `--methods <methods>` - HTTP methods (GET, POST, PUT, DELETE)
- `--validation` - Include input validation
- `--auth` - Include authentication
- `--middleware` - Include middleware

**Examples:**
```bash
# Basic API endpoint
misan create:api users user-management

# API with multiple methods
misan create:api posts blog --methods=GET,POST,PUT,DELETE

# API with validation and auth
misan create:api auth-endpoint auth --validation --auth
```

### `create:page`
Create page components (Next.js, Nuxt.js).

```bash
misan create:page <name> <module> [options]
```

**Arguments:**
- `<name>` - Page name
- `<module>` - Target module name

**Options:**
- `--layout` - Create with layout
- `--dynamic` - Create dynamic page
- `--api` - Include API integration
- `--ssg` - Static site generation
- `--ssr` - Server-side rendering

**Examples:**
```bash
# Basic page
misan create:page user-profile user-management

# Dynamic page with layout
misan create:page user-detail user-management --dynamic --layout

# SSG page
misan create:page blog-post blog --ssg
```

## 🤖 Generation Commands

### `generate`
AI-powered code generation.

```bash
misan generate <type> [options]
```

**Types:**
- `module` - Generate complete module
- `component` - Generate component
- `service` - Generate service
- `hook` - Generate hook
- `type` - Generate type definitions
- `test` - Generate test files
- `api` - Generate API endpoint
- `custom` - Custom generation with AI

**Options:**
- `--ai` - Use AI for generation
- `--prompt <prompt>` - Custom AI prompt
- `--template <template>` - Use specific template
- `--module <module>` - Target module
- `--name <name>` - Generated item name

**Examples:**
```bash
# AI-generated component
misan generate component --ai --prompt="Create a responsive user card"

# Generate service with template
misan generate service --template=api --module=user-management

# Interactive generation
misan generate module

# Custom AI generation
misan generate custom --prompt="Create a shopping cart module"
```

## 🔄 Migration Commands

### `migrate`
Migrate from other tools or project structures.

```bash
misan migrate <source> [options]
```

**Sources:**
- `from-nextisan` - Migrate from legacy Nextisan
- `from-create-react-app` - Migrate from Create React App
- `from-angular-cli` - Migrate from Angular CLI
- `from-vue-cli` - Migrate from Vue CLI

**Options:**
- `--dry-run` - Show what would be migrated
- `-y, --yes` - Skip confirmation prompts
- `--backup` - Create backup before migration

**Examples:**
```bash
# Migrate from legacy Nextisan
misan migrate from-nextisan

# Dry run migration
misan migrate from-create-react-app --dry-run

# Migrate with backup
misan migrate from-nextisan --backup
```

## 🔧 Global Options

All commands support these global options:

- `--help` - Show help information
- `--version` - Show version number
- `--verbose` - Enable verbose logging
- `--quiet` - Suppress output
- `--config <path>` - Use custom config file
- `--no-color` - Disable colored output

## 📖 Command Examples by Use Case

### Setting up a new project
```bash
misan init
misan create:module auth
misan create:component login-form auth
misan create:service auth-service auth
```

### Adding features to existing module
```bash
misan create:component user-profile user-management
misan create:hook use-user-data user-management
misan create:type user-types user-management
```

### API development
```bash
misan create:module api-gateway --template=api
misan create:api users api-gateway --methods=GET,POST,PUT,DELETE
misan create:service user-service api-gateway --server
```

### Testing setup
```bash
misan create:test user-service user-management --type=unit
misan create:test user-card user-management --type=component
```

For more detailed information about specific commands, use:
```bash
misan <command> --help
```
