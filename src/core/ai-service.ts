import { AnthropicProvider } from '@/providers/anthropic-provider';
import { OpenAIProvider } from '@/providers/openai-provider';
import { logError, logInfo, logSuccess } from '@/utils/logger';
import type { Levels } from '@/utils/types';

import type { ModularisanConfig } from './config-manager';

export interface AIProvider {
  name: string;
  generateCode(prompt: string, context: AIContext): Promise<AIResponse>;
  analyzeCode(code: string, context: AIContext): Promise<AIAnalysis>;
  generateDocumentation(code: string, context: AIContext): Promise<string>;
  suggestArchitecture(
    requirements: string,
    context: AIContext
  ): Promise<AIArchitectureSuggestion>;
}

export interface AIContext {
  framework: string;
  language: string;
  moduleType: string;
  existingCode?: string;
  projectStructure?: any;
  dependencies?: string[];
  conventions?: any;
}

export interface AIResponse {
  code: string;
  explanation: string;
  suggestions: string[];
  dependencies?: string[];
  tests?: string;
  documentation?: string;
}

export interface AIAnalysis {
  score: number;
  issues: AIIssue[];
  suggestions: AISuggestion[];
  metrics: AIMetrics;
}

export interface AIIssue {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  line?: number;
  severity: Levels;
  fixSuggestion?: string;
}

export interface AISuggestion {
  type: 'performance' | 'security' | 'maintainability' | 'architecture';
  message: string;
  impact: Levels;
  effort: Levels;
  code?: string;
}

export interface AIMetrics {
  complexity: number;
  maintainability: number;
  testability: number;
  performance: number;
  security: number;
}

export interface AIArchitectureSuggestion {
  modules: string[];
  structure: any;
  dependencies: string[];
  recommendations: string[];
  reasoning: string;
}

export class AIService {
  private config: ModularisanConfig;
  private provider: AIProvider | null = null;

  constructor(config: ModularisanConfig) {
    this.config = config;
    this.initializeProvider();
  }

  private initializeProvider(): void {
    if (!this.config.ai?.enabled) {
      return;
    }

    const providerName = this.config.ai.provider || 'openai';

    try {
      switch (providerName.toLowerCase()) {
        case 'openai':
          this.provider = new OpenAIProvider(this.config.ai);
          break;
        case 'anthropic':
          this.provider = new AnthropicProvider(this.config.ai);
          break;
        default:
          logError(`Unsupported AI provider: ${providerName}`);
          return;
      }

      logInfo(`AI provider initialized: ${providerName}`);
    } catch (error) {
      logError(`Failed to initialize AI provider: ${(error as Error).message}`);
    }
  }

  isEnabled(): boolean {
    return !!this.config.ai?.enabled && this.provider !== null;
  }

  async generateComponent(options: {
    name: string;
    description: string;
    moduleName: string;
    props?: string[];
    features?: string[];
  }): Promise<AIResponse> {
    if (!this.provider) {
      throw new Error('AI provider not initialized');
    }

    const context: AIContext = {
      framework: this.config.framework.name,
      language: this.config.features.typescript ? 'typescript' : 'javascript',
      moduleType: 'component',
      projectStructure: {
        paths: this.config.paths,
        conventions: this.config.conventions,
      },
      conventions: this.config.conventions,
    };

    const prompt = this.buildComponentPrompt(options, context);
    return await this.provider.generateCode(prompt, context);
  }

  async generateService(options: {
    name: string;
    description: string;
    moduleName: string;
    methods?: string[];
    isServer?: boolean;
  }): Promise<AIResponse> {
    if (!this.provider) {
      throw new Error('AI provider not initialized');
    }

    const context: AIContext = {
      framework: this.config.framework.name,
      language: this.config.features.typescript ? 'typescript' : 'javascript',
      moduleType: 'service',
      projectStructure: {
        paths: this.config.paths,
        conventions: this.config.conventions,
      },
      conventions: this.config.conventions,
    };

    const prompt = this.buildServicePrompt(options, context);
    return await this.provider.generateCode(prompt, context);
  }

  async generateModule(options: {
    name: string;
    description: string;
    features?: string[];
    requirements?: string;
  }): Promise<AIResponse> {
    if (!this.provider) {
      throw new Error('AI provider not initialized');
    }

    const context: AIContext = {
      framework: this.config.framework.name,
      language: this.config.features.typescript ? 'typescript' : 'javascript',
      moduleType: 'module',
      projectStructure: {
        paths: this.config.paths,
        conventions: this.config.conventions,
      },
      conventions: this.config.conventions,
    };

    const prompt = this.buildModulePrompt(options, context);
    return await this.provider.generateCode(prompt, context);
  }

  async analyzeCode(code: string, type: string): Promise<AIAnalysis> {
    if (!this.provider) {
      throw new Error('AI provider not initialized');
    }

    const context: AIContext = {
      framework: this.config.framework.name,
      language: this.config.features.typescript ? 'typescript' : 'javascript',
      moduleType: type,
      conventions: this.config.conventions,
    };

    return await this.provider.analyzeCode(code, context);
  }

  async generateDocumentation(code: string, type: string): Promise<string> {
    if (!this.provider) {
      throw new Error('AI provider not initialized');
    }

    const context: AIContext = {
      framework: this.config.framework.name,
      language: this.config.features.typescript ? 'typescript' : 'javascript',
      moduleType: type,
      conventions: this.config.conventions,
    };

    return await this.provider.generateDocumentation(code, context);
  }

  async suggestArchitecture(
    requirements: string
  ): Promise<AIArchitectureSuggestion> {
    if (!this.provider) {
      throw new Error('AI provider not initialized');
    }

    const context: AIContext = {
      framework: this.config.framework.name,
      language: this.config.features.typescript ? 'typescript' : 'javascript',
      moduleType: 'architecture',
      projectStructure: {
        paths: this.config.paths,
        conventions: this.config.conventions,
      },
      conventions: this.config.conventions,
    };

    return await this.provider.suggestArchitecture(requirements, context);
  }

  private buildComponentPrompt(options: any, context: AIContext): string {
    const {
      name,
      description,
      moduleName,
      props = [],
      features = [],
    } = options;

    return `Generate a ${context.framework} component with the following specifications:

Component Name: ${name}
Module: ${moduleName}
Description: ${description}
Language: ${context.language}
Props: ${props.length > 0 ? props.join(', ') : 'None'}
Features: ${features.length > 0 ? features.join(', ') : 'Basic functionality'}

Project Conventions:
- Naming: ${context.conventions?.naming || 'kebab-case'}
- File Extension: ${context.conventions?.file_extensions?.component || '.tsx'}
- Framework: ${context.framework}

Requirements:
1. Create a functional component following ${context.framework} best practices
2. Include proper TypeScript types if applicable
3. Add JSDoc comments for documentation
4. Include basic styling structure
5. Make it responsive and accessible
6. Follow the project's naming conventions
7. Include prop validation
8. Add error boundaries if needed

Please provide:
1. The component code
2. Props interface/types
3. Basic styling suggestions
4. Usage examples
5. Test file structure if testing is enabled`;
  }

  private buildServicePrompt(options: any, context: AIContext): string {
    const {
      name,
      description,
      moduleName,
      methods = [],
      isServer = false,
    } = options;

    return `Generate a ${context.framework} service with the following specifications:

Service Name: ${name}
Module: ${moduleName}
Description: ${description}
Language: ${context.language}
Methods: ${methods.length > 0 ? methods.join(', ') : 'CRUD operations'}
Environment: ${isServer ? 'Server-side' : 'Client-side'}

Project Conventions:
- Naming: ${context.conventions?.naming || 'kebab-case'}
- File Extension: ${context.conventions?.file_extensions?.service || '.ts'}
- Framework: ${context.framework}

Requirements:
1. Create a service class following ${context.framework} patterns
2. Include proper error handling
3. Add TypeScript types and interfaces
4. Include JSDoc comments
5. Implement async/await patterns
6. Add input validation
7. Include logging where appropriate
8. Follow SOLID principles

Please provide:
1. The service class code
2. Interface definitions
3. Error handling patterns
4. Usage examples
5. Test file structure
6. Dependencies needed`;
  }

  private buildModulePrompt(options: any, context: AIContext): string {
    const { name, description, features = [], requirements = '' } = options;

    return `Generate a complete ${context.framework} module with the following specifications:

Module Name: ${name}
Description: ${description}
Language: ${context.language}
Features: ${features.length > 0 ? features.join(', ') : 'Basic module structure'}
Requirements: ${requirements}

Project Conventions:
- Naming: ${context.conventions?.naming || 'kebab-case'}
- Framework: ${context.framework}
- Paths: ${JSON.stringify(context.projectStructure?.paths || {})}

Requirements:
1. Create a complete module structure
2. Include components, services, and types
3. Add proper exports and imports
4. Include README documentation
5. Add basic tests if testing is enabled
6. Follow modular architecture principles
7. Include proper error handling
8. Add TypeScript support if enabled

Please provide:
1. Module structure and file organization
2. Component files needed
3. Service files needed
4. Type definitions
5. Index file with exports
6. README documentation
7. Test file structure
8. Dependencies and imports`;
  }

  /**
   * Save AI-generated code to the file system
   */
  async saveGeneratedCode(
    response: AIResponse,
    targetPath: string,
    fileName: string,
    dryRun: boolean = false
  ): Promise<void> {
    const fs = await import('fs-extra');
    const path = await import('path');

    const filePath = path.join(targetPath, fileName);

    if (dryRun) {
      logInfo(`[DRY RUN] Would create directory: ${targetPath}`);
      logInfo(`[DRY RUN] Would save code to: ${filePath}`);

      if (response.tests) {
        const testFileName = fileName.replace(/\.(tsx?|jsx?)$/, '.test$1');
        const testFilePath = path.join(targetPath, testFileName);
        logInfo(`[DRY RUN] Would save test file to: ${testFilePath}`);
      }

      if (response.documentation) {
        const docFileName = fileName.replace(/\.(tsx?|jsx?)$/, '.md');
        const docFilePath = path.join(targetPath, docFileName);
        logInfo(`[DRY RUN] Would save documentation to: ${docFilePath}`);
      }

      return;
    }

    // Ensure directory exists
    await fs.ensureDir(targetPath);

    // Save the main code file
    await fs.writeFile(filePath, response.code);
    logSuccess(`Code saved to: ${filePath}`);

    // Save test file if provided
    if (response.tests) {
      const testFileName = fileName.replace(/(\.(tsx?|jsx?))$/, '.test$1');
      const testFilePath = path.join(targetPath, testFileName);
      await fs.writeFile(testFilePath, response.tests);
      logSuccess(`Test file saved to: ${testFilePath}`);
    }

    // Save documentation if provided
    if (response.documentation) {
      const docFileName = fileName.replace(/(\.(tsx?|jsx?))$/, '.md');
      const docFilePath = path.join(targetPath, docFileName);
      await fs.writeFile(docFilePath, response.documentation);
      logSuccess(`Documentation saved to: ${docFilePath}`);
    }
  }

  /**
   * Estimate cost of AI API call based on prompt length
   */
  async estimateCost(prompt: string, provider?: string): Promise<number> {
    const providerName = provider || this.config.ai?.provider || 'openai';

    // Rough token estimation: ~4 characters per token
    const estimatedTokens = Math.ceil(prompt.length / 4);

    // Cost per 1K tokens (approximate, as of 2024)
    const costPer1K: Record<string, { input: number; output: number }> = {
      openai: { input: 0.01, output: 0.03 }, // GPT-4 pricing
      anthropic: { input: 0.008, output: 0.024 }, // Claude 3 pricing
    };

    const pricing = costPer1K[providerName.toLowerCase()] ?? costPer1K.openai;

    // Estimate input + output tokens (assume output is 2x input)
    const inputCost = (estimatedTokens / 1000) * pricing!.input;
    const outputCost = ((estimatedTokens * 2) / 1000) * pricing!.output;

    return Number((inputCost + outputCost).toFixed(4));
  }
}
