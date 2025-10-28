import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ModularisanError,
  ValidationError,
  ConfigurationError,
  FileSystemError,
  AIProviderError,
  handleError,
} from '../errors';

describe('Error Classes', () => {
  describe('ModularisanError', () => {
    it('should create error with message and code', () => {
      const error = new ModularisanError('Test error', 'TEST_CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ModularisanError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ModularisanError');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toBeUndefined();
    });

    it('should create error with details', () => {
      const details = { field: 'username', value: 'invalid' };
      const error = new ModularisanError('Test error', 'TEST_CODE', details);

      expect(error.details).toEqual(details);
    });

    it('should capture stack trace', () => {
      const error = new ModularisanError('Test error', 'TEST_CODE');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ModularisanError');
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ModularisanError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
    });

    it('should accept details parameter', () => {
      const details = { field: 'email', reason: 'Invalid format' };
      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('ConfigurationError', () => {
    it('should create ConfigurationError with correct properties', () => {
      const error = new ConfigurationError('Config not found');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ModularisanError);
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.message).toBe('Config not found');
    });

    it('should accept details parameter', () => {
      const details = { path: '/path/to/config.yml' };
      const error = new ConfigurationError('Invalid config', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('FileSystemError', () => {
    it('should create FileSystemError with correct properties', () => {
      const error = new FileSystemError('File not found');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ModularisanError);
      expect(error).toBeInstanceOf(FileSystemError);
      expect(error.name).toBe('FileSystemError');
      expect(error.code).toBe('FILESYSTEM_ERROR');
      expect(error.message).toBe('File not found');
    });

    it('should accept details parameter', () => {
      const details = { path: '/path/to/file.txt', operation: 'read' };
      const error = new FileSystemError('Read failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('AIProviderError', () => {
    it('should create AIProviderError with correct properties', () => {
      const error = new AIProviderError('API call failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ModularisanError);
      expect(error).toBeInstanceOf(AIProviderError);
      expect(error.name).toBe('AIProviderError');
      expect(error.code).toBe('AI_PROVIDER_ERROR');
      expect(error.message).toBe('API call failed');
    });

    it('should accept details parameter', () => {
      const details = { provider: 'openai', statusCode: 429 };
      const error = new AIProviderError('Rate limit exceeded', details);

      expect(error.details).toEqual(details);
    });
  });
});

describe('handleError', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let originalDebug: string | undefined;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as never);
    originalDebug = process.env.DEBUG;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    process.env.DEBUG = originalDebug;
  });

  it('should handle ModularisanError', () => {
    const error = new ValidationError('Test validation error');

    handleError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith('\n❌ Test validation error');
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should show details in debug mode for ModularisanError', () => {
    process.env.DEBUG = 'true';
    const details = { field: 'username' };
    const error = new ValidationError('Test error', details);

    handleError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith('\n❌ Test error');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Details:',
      JSON.stringify(details, null, 2)
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle standard Error', () => {
    const error = new Error('Standard error message');

    handleError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '\n❌ Unexpected error: Standard error message'
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should show stack trace in debug mode for standard Error', () => {
    process.env.DEBUG = 'true';
    const error = new Error('Standard error');

    handleError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '\n❌ Unexpected error: Standard error'
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle unknown error types', () => {
    const error = 'string error';

    handleError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '\n❌ An unknown error occurred'
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle null error', () => {
    handleError(null);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '\n❌ An unknown error occurred'
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle undefined error', () => {
    handleError(undefined);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '\n❌ An unknown error occurred'
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
