# Getting Started with Modularisan

This guide will help you get up and running with Modularisan quickly.

## 📋 Prerequisites

- **Node.js** 16.0.0 or higher
- **npm**, **yarn**, or **pnpm** package manager
- A JavaScript/TypeScript project (or ready to create one)

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g modularisan
# or
yarn global add modularisan
# or
pnpm add -g modularisan
```

### Using npx (No Installation Required)

```bash
npx modularisan <command>
```

### Verify Installation

```bash
misan --version
# or
modularisan --version
```

## 🏃 Quick Start

### 1. Initialize Your Project

Navigate to your project directory and run:

```bash
cd your-project
misan init
```

This will:
- Detect your framework automatically
- Create a `modularisan.config.yml` file
- Set up the basic directory structure
- Configure paths and conventions

### 2. Create Your First Module

```bash
misan create:module user-management
```

This creates a complete module with:
- Component directory
- Services directory
- Types directory
- Index file
- README documentation

### 3. Add Components to Your Module

```bash
misan create:component user-profile user-management
```

### 4. Add Services

```bash
misan create:service user-service user-management
```

### 5. List Your Modules

```bash
misan list modules
```

## 📁 Project Structure

After initialization, your project will have:

```
your-project/
├── modularisan.config.yml          # Configuration file
├── src/
│   ├── modules/                     # Feature modules
│   │   └── user-management/
│   │       ├── components/
│   │       ├── services/
│   │       ├── types/
│   │       ├── index.ts
│   │       └── README.md
│   └── shared/                      # Shared utilities
│       ├── components/
│       ├── services/
│       ├── types/
│       └── utils/
```

## 🎯 Framework-Specific Setup

### Next.js
```bash
# Automatic detection for Next.js projects
misan init

# Create API routes
misan create:api users --module=user-management

# Create pages
misan create:page user-dashboard --module=user-management
```

### React
```bash
# Automatic detection for React projects
misan init

# Create hooks
misan create:hook use-user-data --module=user-management
```

### Vue.js
```bash
# Automatic detection for Vue projects
misan init

# Create composition API components
misan create:component user-form user-management --composition
```

### Angular
```bash
# Automatic detection for Angular projects
misan init

# Create services with dependency injection
misan create:service user-service user-management --injectable
```

## ⚙️ Basic Configuration

Your `modularisan.config.yml` file controls how Modularisan works:

```yaml
version: "2.0.0"
framework:
  name: "Next.js"
  type: "fullstack"
  version: "^14.0.0"
project:
  name: "my-awesome-app"
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
```

## 🔧 Common Commands

```bash
# Project initialization
misan init

# Module management
misan create:module <name>
misan list modules

# Component creation
misan create:component <name> <module>
misan create:service <name> <module>
misan create:type <name> <module>

# Code generation
misan generate component --ai
misan generate service --module=user-management

# Configuration
misan config show
misan config set features.typescript true

# Project debugging
misan debug
```

## 🚧 Migration from Other Tools

### From Legacy Nextisan
```bash
misan migrate from-nextisan
```

### From Create React App
```bash
misan migrate from-create-react-app
```

## 📚 What's Next?

Now that you have Modularisan set up, explore these topics:

1. **[Configuration](configuration.md)** - Customize Modularisan for your needs
2. **[Commands](commands.md)** - Learn all available commands
3. **[Modules](modules.md)** - Deep dive into modular architecture
4. **[Templates](templates.md)** - Customize code generation templates
5. **[Best Practices](best-practices.md)** - Recommended patterns

## 🆘 Need Help?

- Check the [Troubleshooting Guide](troubleshooting.md)
- Browse [Examples](examples.md)
- Visit [GitHub Issues](https://github.com/ife-adewunmi/modularisan/issues)
- Join [Discussions](https://github.com/ife-adewunmi/modularisan/discussions)

## 🎉 You're Ready!

You now have a solid foundation with Modularisan. Start creating modules and building your modular architecture!
