# Modularisan 🚀

**A framework-agnostic CLI tool for generating modular, scalable code structures inspired by Laravel modules.**

[![npm version](https://badge.fury.io/js/modularisan.svg)](https://badge.fury.io/js/modularisan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Modularisan** (formerly Nextisan) is a powerful CLI tool that helps you create and manage modular application architectures across multiple JavaScript/TypeScript frameworks. Whether you're building with Next.js, React, Vue, Angular, or Node.js backends, Modularisan provides a consistent, scalable approach to organizing your code.

## ✨ Features

- 🔧 **Framework Agnostic**: Supports Next.js, Nuxt.js, React, Vue.js, Angular, Nest.js, Express.js, and more
- 📦 **Modular Architecture**: Create self-contained modules with their own components, services, and tests
- 🎯 **Domain-Driven Design**: Organize code by business domains and features
- 🤖 **AI Integration**: Future-ready with planned AI-powered code generation
- 📋 **Template System**: Extensible template system for custom code generation
- 🔄 **Migration Tools**: Easy migration from existing projects and legacy tools
- ⚙️ **Configurable**: Flexible configuration system with YAML support
- 🧪 **Testing Ready**: Built-in testing file generation and structure

## 🛠 Installation

### Global Installation

```bash
npm install -g modularisan
# or
yarn global add modularisan
# or
pnpm add -g modularisan
```

### Using npx (Recommended for trying out)

```bash
npx modularisan <command>
```

## 🚀 Quick Start

### 1. Initialize Your Project

```bash
# Navigate to your project directory
cd my-project

# Initialize Modularisan configuration
misan init
```

This will:
- Detect your framework automatically
- Create a `modularisan.config.yml` file
- Set up the basic directory structure
- Configure paths and conventions

### 2. Create Your First Module

```bash
# Create a user management module
misan create:module user-management
```

### 3. Add Components to Your Module

```bash
# Add a component to the user-management module
misan create:component user-profile user-management

# Add a service to handle user operations
misan create:service user-service user-management
```

### 4. List Your Modules

```bash
# View all modules
misan list modules

# View detailed module information
misan list modules --detailed
```

## 📚 Supported Frameworks

| Framework | Type | Status | Features |
|-----------|------|--------|---------|
| **Next.js** | Fullstack | ✅ Full Support | SSR, API Routes, App Router |
| **Nuxt.js** | Fullstack | ✅ Full Support | SSR, Server API, Auto-imports |
| **React** | Frontend | ✅ Full Support | Components, Hooks, Context |
| **Vue.js** | Frontend | ✅ Full Support | Composition API, SFC |
| **Angular** | Frontend | ✅ Full Support | Components, Services, Modules |
| **Svelte** | Frontend | ✅ Full Support | Components, Stores |
| **Nest.js** | Backend | ✅ Full Support | Controllers, Services, Guards |
| **Express.js** | Backend | ✅ Full Support | Routes, Middleware, Services |

## 📖 Commands

### Project Management

```bash
# Initialize project configuration
misan init [options]

# Show current configuration
misan config show

# Update configuration
misan config set features.typescript true

# Validate project setup
misan debug
```

### Module Management

```bash
# Create a new module
misan create:module <name> [options]

# List all modules
misan list modules [--detailed]

# Generate with templates
misan create:module user-auth --template=api
```

#### Module Templates

- **basic**: Components, services, types
- **full**: All features including hooks, utils, tests
- **api**: Backend-focused with controllers and middleware
- **ui**: Frontend-focused with components and styles

### Component Creation

```bash
# Create a component in a module
misan create:component <name> <module> [options]

# Examples
misan create:component login-form auth
misan create:component user-card user-management --props --story
```

### Service Creation

```bash
# Create a service in a module
misan create:service <name> <module> [options]

# Examples
misan create:service auth-service auth
misan create:service user-api user-management --server
```

### AI-Powered Generation

```bash
# Generate components with AI
misan generate component --ai --prompt="Create a responsive user card with avatar and status"

# Generate complete modules
misan generate module --ai --prompt="E-commerce shopping cart module"

# Analyze existing code
misan ai:analyze src/components/Button.tsx --metrics

# Generate documentation
misan ai:docs src/services/api.ts --format=markdown

# Get architecture suggestions
misan ai:architect "E-commerce platform with user auth" --create-modules
```

### Migration Tools

```bash
# Migrate from legacy Nextisan
misan migrate from-nextisan

# Migrate from Create React App
misan migrate from-create-react-app

# Dry run to see what would be migrated
misan migrate from-nextisan --dry-run
```

## ⚙️ Configuration

Modularisan uses a `modularisan.config.yml` file for configuration:

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
ai:
  enabled: false
  provider: "openai"
  model: "gpt-4"
```

### Configuration Commands

```bash
# Show current config
misan config show

# Set a value
misan config set features.standalone_modules true

# Get a specific value
misan config get framework.name

# Edit config file
misan config edit

# Validate configuration
misan config validate
```

## 🏗 Project Structure

Modularisan creates a clean, scalable project structure:

```
my-project/
├── modularisan.config.yml          # Configuration file
├── src/
│   ├── modules/                     # Feature modules
│   │   ├── user-management/
│   │   │   ├── components/
│   │   │   │   ├── user-profile.tsx
│   │   │   │   └── index.ts
│   │   │   ├── services/
│   │   │   │   ├── user-service.ts
│   │   │   │   └── index.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── hooks/              # React/Vue specific
│   │   │   ├── tests/
│   │   │   ├── index.ts            # Module exports
│   │   │   └── README.md           # Module documentation
│   │   └── auth/
│   │       └── ...
│   ├── shared/                     # Shared utilities
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── app/                        # Framework-specific (Next.js, etc.)
└── __tests__/                      # Global tests
```

## 🎯 Module Architecture

Each module is self-contained and follows domain-driven design principles:

### Basic Module Structure

```
user-management/
├── components/          # UI components
│   ├── user-card.tsx
│   ├── user-list.tsx
│   └── index.ts
├── services/           # Business logic
│   ├── user-service.ts
│   ├── user-api.ts
│   └── index.ts
├── types/              # Type definitions
│   ├── user.types.ts
│   └── index.ts
├── hooks/              # Custom hooks (React/Vue)
│   ├── use-user.ts
│   └── index.ts
├── utils/              # Module-specific utilities
├── tests/              # Module tests
├── index.ts            # Main module exports
└── README.md           # Module documentation
```

### Standalone Modules

For microservice-like architecture, enable standalone modules:

```bash
misan config set features.standalone_modules true
misan config set features.package_per_module true
```

This creates modules with their own `package.json`:

```
user-management/
├── package.json        # Module dependencies
├── components/
├── services/
└── ...
```

## 🔧 Advanced Usage

### Custom Templates

Create custom templates for your organization:

```bash
# Create a custom module template
misan create:module payment --template=custom --components="gateway,webhook,validation"
```

### Framework-Specific Features

#### Next.js
```bash
# Create API route
misan create:api users --module=user-management

# Create page with layout
misan create:page user-dashboard --module=user-management --layout
```

#### Vue.js
```bash
# Create composition API component
misan create:component user-form user-management --composition

# Create Pinia store
misan create:store user-store user-management
```

#### Angular
```bash
# Create service with dependency injection
misan create:service user-service user-management --injectable

# Create guard
misan create:guard auth-guard auth
```

### Testing Integration

```bash
# Generate tests for existing components
misan generate test --module=user-management --component=user-card

# Create test utilities
misan create:test test-utils shared --type=utility
```

## 🚀 Migration Guide

### From Legacy Nextisan

```bash
# Automatic migration
misan migrate from-nextisan

# Preview changes
misan migrate from-nextisan --dry-run
```

### From Create React App

```bash
# Migrate CRA project
misan migrate from-create-react-app
```

### Manual Migration

1. Install Modularisan in your existing project
2. Run `misan init` to create configuration
3. Gradually move existing code into modules:
   ```bash
   # Create modules for existing features
   misan create:module existing-feature
   # Move files manually or use migration tools
   ```

## 🤖 AI Integration

### Available Features

- **✅ Intelligent Code Generation**: Describe what you want, get working code
- **✅ Code Analysis**: Analyze existing code and suggest improvements
- **✅ Architecture Recommendations**: Get suggestions for optimal module structure
- **✅ Documentation Generation**: Auto-generate documentation from code

### Setup AI

```bash
# Enable AI features
misan config set ai.enabled true
misan config set ai.provider openai
misan config set ai.model gpt-4

# Set API key (use environment variable in production)
export OPENAI_API_KEY="your-api-key"
```

### AI Commands

```bash
# Code Analysis
misan ai:analyze [file] --type=component --metrics --fix

# Documentation Generation
misan ai:docs [file] --format=markdown --output=docs/

# Architecture Suggestions
misan ai:architect [requirements] --interactive --create-modules

# AI-Enhanced Generation
misan generate component --ai
misan generate service --ai
misan generate module --ai
```

### Supported AI Providers

- **OpenAI**: GPT-3.5, GPT-4 (recommended)
- **Anthropic**: Claude (coming soon)
- **Local Models**: Ollama integration (planned)

### Example AI Workflows

```bash
# Analyze and improve existing code
misan ai:analyze src/components/UserCard.tsx --fix --metrics

# Generate architecture for new project
misan ai:architect "Social media platform with real-time chat" --interactive

# Create AI-generated component
misan generate component --ai --prompt="Responsive pricing card with animations"

# Generate comprehensive documentation
misan ai:docs src/services/ --format=html --output=docs/api/
```

## 🛠 Development

### Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ife-adewunmi/modularisan.git
cd modularisan

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm link

# Test the CLI
misan --help
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## 📋 Roadmap

### v1.1 (Q2 2024)
- [x] AI-powered code generation
- [x] Code analysis tools
- [x] Architecture recommendations
- [x] Documentation generation
- [ ] Advanced template customization
- [ ] Plugin system
- [ ] More framework integrations

### v1.2 (Q4 2025)
- [ ] Visual module designer
- [ ] Real-time AI code suggestions
- [ ] Code analysis tools
- [ ] Performance optimisation suggestions
- [ ] Team collaboration features
- [ ] Advanced AI providers (Claude, local models)

### v2.0 (Q1 2026)
- [ ] Multi-language support
- [ ] Advanced AI features (code refactoring, migration)
- [ ] Cloud integration
- [ ] Enterprise features
- [ ] AI-powered project templates

## 🤝 Support

### Community

- **GitHub Issues**: [Report bugs and request features](https://github.com/ife-adewunmi/modularisan/issues)
- **Discussions**: [Community discussions](https://github.com/ife-adewunmi/modularisan/discussions)
- **Twitter**: [@modularisan](https://twitter.com/modularisan)

### Professional Support

For enterprise support, training, and consulting, contact: [support@modularisan.dev](mailto:support@modularisan.dev)

## 📄 License

MIT © [Ifeoluwa Adewunmi](https://github.com/ife-adewunmi)

## 🙏 Acknowledgments

- Inspired by **Laravel Artisan** and **Laravel Modules**
- Built with ❤️ for the JavaScript/TypeScript community
- Thanks to all contributors and early adopters

---

**Happy Coding! 🚀**

*Modularisan - Making modular architecture accessible to everyone.*
