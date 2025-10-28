import Anthropic from '@anthropic-ai/sdk';

import { AIProviderError } from '@/utils/errors';
import { logInfo, logDebug } from '@/utils/logger';

import type {
  AIProvider,
  AIContext,
  AIResponse,
  AIAnalysis,
  AIArchitectureSuggestion,
} from '../core/ai-service';

interface AnthropicConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Anthropic Provider - Production Implementation
 *
 * Integrates with Anthropic's Claude API for code generation, analysis, and architecture suggestions.
 * Supports Claude 3 Opus, Sonnet, and Haiku models.
 */
export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config?: AnthropicConfig) {
    const apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new AIProviderError(
        'Anthropic API key not provided. Set ANTHROPIC_API_KEY environment variable or pass apiKey in config.',
        {
          provider: 'anthropic',
          solution: 'Get your API key from https://console.anthropic.com/',
        }
      );
    }

    this.client = new Anthropic({ apiKey });
    this.model =
      config?.model ||
      process.env.ANTHROPIC_MODEL ||
      'claude-3-5-sonnet-20241022';
    this.maxTokens = config?.maxTokens || 4096;
    this.temperature = config?.temperature || 0.7;

    logInfo(`Anthropic Provider initialized with model: ${this.model}`);
  }

  async generateCode(prompt: string, context: AIContext): Promise<AIResponse> {
    try {
      logDebug(
        `Anthropic generateCode request: ${prompt.substring(0, 100)}...`
      );

      const systemPrompt = this.buildSystemPrompt('code-generation', context);
      const userPrompt = this.buildCodeGenerationPrompt(prompt, context);

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = message.content[0];
      if (!content || content.type !== 'text') {
        throw new AIProviderError('No text response from Anthropic', {
          provider: 'anthropic',
        });
      }

      return this.parseCodeGenerationResponse(content.text);
    } catch (error) {
      if (error instanceof AIProviderError) throw error;

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new AIProviderError(
        `Anthropic code generation failed: ${errorMessage}`,
        {
          provider: 'anthropic',
          model: this.model,
          error: errorMessage,
        }
      );
    }
  }

  async analyzeCode(code: string, context: AIContext): Promise<AIAnalysis> {
    try {
      logDebug(`Anthropic analyzeCode request for ${code.length} characters`);

      const systemPrompt = this.buildSystemPrompt('code-analysis', context);
      const userPrompt = this.buildCodeAnalysisPrompt(code, context);

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.3, // Lower temperature for more consistent analysis
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = message.content[0];
      if (!content || content.type !== 'text') {
        throw new AIProviderError('No text response from Anthropic', {
          provider: 'anthropic',
        });
      }

      return this.parseCodeAnalysisResponse(content.text);
    } catch (error) {
      if (error instanceof AIProviderError) throw error;

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new AIProviderError(
        `Anthropic code analysis failed: ${errorMessage}`,
        {
          provider: 'anthropic',
          model: this.model,
          error: errorMessage,
        }
      );
    }
  }

  async generateDocumentation(
    code: string,
    context: AIContext
  ): Promise<string> {
    try {
      logDebug(
        `Anthropic generateDocumentation request for ${code.length} characters`
      );

      const systemPrompt = this.buildSystemPrompt('documentation', context);
      const userPrompt = this.buildDocumentationPrompt(code, context);

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.5,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = message.content[0];
      if (!content || content.type !== 'text') {
        throw new AIProviderError('No text response from Anthropic', {
          provider: 'anthropic',
        });
      }

      return content.text.trim();
    } catch (error) {
      if (error instanceof AIProviderError) throw error;

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new AIProviderError(
        `Anthropic documentation generation failed: ${errorMessage}`,
        {
          provider: 'anthropic',
          model: this.model,
          error: errorMessage,
        }
      );
    }
  }

  async suggestArchitecture(
    requirements: string,
    context: AIContext
  ): Promise<AIArchitectureSuggestion> {
    try {
      logDebug(
        `Anthropic suggestArchitecture request: ${requirements.substring(0, 100)}...`
      );

      const systemPrompt = this.buildSystemPrompt('architecture', context);
      const userPrompt = this.buildArchitecturePrompt(requirements, context);

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = message.content[0];
      if (!content || content.type !== 'text') {
        throw new AIProviderError('No text response from Anthropic', {
          provider: 'anthropic',
        });
      }

      return this.parseArchitectureResponse(content.text);
    } catch (error) {
      if (error instanceof AIProviderError) throw error;

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new AIProviderError(
        `Anthropic architecture suggestion failed: ${errorMessage}`,
        {
          provider: 'anthropic',
          model: this.model,
          error: errorMessage,
        }
      );
    }
  }

  // Private helper methods

  private buildSystemPrompt(task: string, context: AIContext): string {
    const basePrompt = 'You are an expert software architect and developer.';
    const frameworkInfo = context.framework
      ? ` You are working with ${context.framework} framework.`
      : '';
    const languageInfo = context.language
      ? ` The code should be in ${context.language}.`
      : '';

    let taskSpecific = '';
    switch (task) {
      case 'code-generation':
        taskSpecific =
          ' Generate clean, production-ready code following best practices and industry standards.';
        break;
      case 'code-analysis':
        taskSpecific =
          ' Analyze code for quality, security, performance, and maintainability. Provide actionable insights.';
        break;
      case 'documentation':
        taskSpecific =
          ' Generate comprehensive, clear documentation using JSDoc/TSDoc format.';
        break;
      case 'architecture':
        taskSpecific =
          ' Suggest scalable, maintainable architecture patterns based on project requirements.';
        break;
    }

    return basePrompt + frameworkInfo + languageInfo + taskSpecific;
  }

  private buildCodeGenerationPrompt(
    prompt: string,
    context: AIContext
  ): string {
    let fullPrompt = prompt;

    if (context.moduleType) {
      fullPrompt += `\n\nModule Type: ${context.moduleType}`;
    }

    if (context.projectStructure) {
      fullPrompt += `\nProject Structure: ${JSON.stringify(context.projectStructure)}`;
    }

    fullPrompt += '\n\nRespond with JSON in this format:';
    fullPrompt += '\n{';
    fullPrompt += '\n  "code": "the generated code",';
    fullPrompt +=
      '\n  "explanation": "brief explanation of what the code does",';
    fullPrompt += '\n  "suggestions": ["suggestion 1", "suggestion 2"]';
    fullPrompt += '\n}';

    return fullPrompt;
  }

  private buildCodeAnalysisPrompt(code: string, context: AIContext): string {
    let prompt = `Analyze the following code:\n\n\`\`\`${context.language || 'typescript'}\n${code}\n\`\`\``;

    prompt += '\n\nRespond with JSON in this format:';
    prompt += '\n{';
    prompt += '\n  "score": 85,';
    prompt +=
      '\n  "issues": [{"type": "warning", "message": "...", "severity": "medium"}],';
    prompt +=
      '\n  "suggestions": [{"type": "performance", "message": "...", "impact": "medium", "effort": "low"}],';
    prompt +=
      '\n  "metrics": {"complexity": 5, "maintainability": 75, "testability": 80, "performance": 70, "security": 85}';
    prompt += '\n}';

    return prompt;
  }

  private buildDocumentationPrompt(code: string, context: AIContext): string {
    let prompt = `Generate comprehensive documentation for the following code:\n\n\`\`\`${
      context.language || 'typescript'
    }\n${code}\n\`\`\``;

    prompt += '\n\nInclude:';
    prompt += '\n- Description of what the code does';
    prompt += '\n- Parameter descriptions';
    prompt += '\n- Return value description';
    prompt += '\n- Usage examples';
    prompt += '\n- Any important notes or caveats';

    if (
      context.language === 'typescript' ||
      context.language === 'javascript'
    ) {
      prompt += '\n\nUse JSDoc/TSDoc format.';
    }

    return prompt;
  }

  private buildArchitecturePrompt(
    requirements: string,
    context: AIContext
  ): string {
    let prompt = `Based on these requirements, suggest a modular architecture:\n\n${requirements}`;

    if (context.framework) {
      prompt += `\n\nFramework: ${context.framework}`;
    }

    prompt += '\n\nRespond with JSON in this format:';
    prompt += '\n{';
    prompt += '\n  "modules": ["module1", "module2"],';
    prompt +=
      '\n  "structure": {"module1": {"components": [], "services": []}},';
    prompt += '\n  "dependencies": ["package1", "package2"],';
    prompt +=
      '\n  "recommendations": ["recommendation 1", "recommendation 2"],';
    prompt += '\n  "reasoning": "explanation of the architecture decisions"';
    prompt += '\n}';

    return prompt;
  }

  private parseCodeGenerationResponse(content: string): AIResponse {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch?.[1] ?? content;

      const parsed = JSON.parse(jsonString.trim());
      return {
        code: parsed.code || '',
        explanation: parsed.explanation || '',
        suggestions: parsed.suggestions || [],
      };
    } catch {
      // Fallback: return raw content as code
      return {
        code: content,
        explanation: 'Generated code',
        suggestions: [],
      };
    }
  }

  private parseCodeAnalysisResponse(content: string): AIAnalysis {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch?.[1] ?? content;

      const parsed = JSON.parse(jsonString.trim());
      return {
        score: parsed.score || 70,
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || [],
        metrics: parsed.metrics || {
          complexity: 50,
          maintainability: 70,
          testability: 70,
          performance: 70,
          security: 70,
        },
      };
    } catch {
      // Fallback analysis
      return {
        score: 70,
        issues: [],
        suggestions: [
          {
            type: 'maintainability',
            message: content,
            impact: 'low',
            effort: 'low',
          },
        ],
        metrics: {
          complexity: 50,
          maintainability: 70,
          testability: 70,
          performance: 70,
          security: 70,
        },
      };
    }
  }

  private parseArchitectureResponse(content: string): AIArchitectureSuggestion {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch?.[1] ?? content;

      const parsed = JSON.parse(jsonString.trim());
      return {
        modules: parsed.modules || [],
        structure: parsed.structure || {},
        dependencies: parsed.dependencies || [],
        recommendations: parsed.recommendations || [],
        reasoning: parsed.reasoning || '',
      };
    } catch {
      // Fallback architecture
      return {
        modules: [],
        structure: {},
        dependencies: [],
        recommendations: [content],
        reasoning: 'AI-suggested architecture',
      };
    }
  }
}
