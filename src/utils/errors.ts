export class ModularisanError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ModularisanError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ModularisanError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends ModularisanError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

export class FileSystemError extends ModularisanError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'FILESYSTEM_ERROR', details);
    this.name = 'FileSystemError';
  }
}

export class AIProviderError extends ModularisanError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AI_PROVIDER_ERROR', details);
    this.name = 'AIProviderError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof ModularisanError) {
    console.error(`\n❌ ${error.message}`);
    if (error.details && process.env.DEBUG) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error(`\n❌ Unexpected error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }

  console.error('\n❌ An unknown error occurred');
  process.exit(1);
}
