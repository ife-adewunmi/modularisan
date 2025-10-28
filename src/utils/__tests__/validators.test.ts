import { describe, it, expect } from 'vitest';
import {
  moduleNameSchema,
  componentNameSchema,
  frameworkSchema,
  validateName,
  validatePath,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  validateModuleName,
  validateModuleNameStrict,
  validateComponentName,
  validateComponentNameStrict,
  validateFramework,
  validateFileExtension,
  type Framework,
} from '../validators';
import { ValidationError } from '../errors';

describe('Zod Schemas', () => {
  describe('moduleNameSchema', () => {
    it('should accept valid kebab-case module names', () => {
      expect(moduleNameSchema.parse('user-management')).toBe('user-management');
      expect(moduleNameSchema.parse('auth-service')).toBe('auth-service');
      expect(moduleNameSchema.parse('api-client')).toBe('api-client');
      expect(moduleNameSchema.parse('hello')).toBe('hello');
    });

    it('should reject module names with uppercase letters', () => {
      expect(() => moduleNameSchema.parse('User-Management')).toThrow();
      expect(() => moduleNameSchema.parse('UserManagement')).toThrow();
    });

    it('should reject module names with underscores', () => {
      expect(() => moduleNameSchema.parse('user_management')).toThrow();
    });

    it('should reject module names with special characters', () => {
      expect(() => moduleNameSchema.parse('user@management')).toThrow();
      expect(() => moduleNameSchema.parse('user!module')).toThrow();
    });

    it('should reject module names that are too short', () => {
      expect(() => moduleNameSchema.parse('a')).toThrow();
      expect(() => moduleNameSchema.parse('')).toThrow();
    });

    it('should reject module names that are too long', () => {
      const longName = 'a'.repeat(51);
      expect(() => moduleNameSchema.parse(longName)).toThrow();
    });

    it('should reject module names starting with numbers', () => {
      expect(() => moduleNameSchema.parse('1-module')).toThrow();
    });
  });

  describe('componentNameSchema', () => {
    it('should accept valid PascalCase component names', () => {
      expect(componentNameSchema.parse('UserCard')).toBe('UserCard');
      expect(componentNameSchema.parse('LoginForm')).toBe('LoginForm');
      expect(componentNameSchema.parse('Button')).toBe('Button');
      expect(componentNameSchema.parse('APIClient')).toBe('APIClient');
    });

    it('should reject camelCase component names', () => {
      expect(() => componentNameSchema.parse('userCard')).toThrow();
      expect(() => componentNameSchema.parse('loginForm')).toThrow();
    });

    it('should reject kebab-case component names', () => {
      expect(() => componentNameSchema.parse('user-card')).toThrow();
      expect(() => componentNameSchema.parse('login-form')).toThrow();
    });

    it('should reject component names with special characters', () => {
      expect(() => componentNameSchema.parse('User@Card')).toThrow();
      expect(() => componentNameSchema.parse('Login_Form')).toThrow();
    });

    it('should reject component names that are too short', () => {
      expect(() => componentNameSchema.parse('A')).toThrow();
      expect(() => componentNameSchema.parse('')).toThrow();
    });
  });

  describe('frameworkSchema', () => {
    it('should accept valid framework names', () => {
      expect(frameworkSchema.parse('nextjs')).toBe('nextjs');
      expect(frameworkSchema.parse('nuxtjs')).toBe('nuxtjs');
      expect(frameworkSchema.parse('react')).toBe('react');
      expect(frameworkSchema.parse('vue')).toBe('vue');
      expect(frameworkSchema.parse('angular')).toBe('angular');
      expect(frameworkSchema.parse('svelte')).toBe('svelte');
      expect(frameworkSchema.parse('nestjs')).toBe('nestjs');
      expect(frameworkSchema.parse('express')).toBe('express');
    });

    it('should reject invalid framework names', () => {
      expect(() => frameworkSchema.parse('invalid')).toThrow();
      expect(() => frameworkSchema.parse('ember')).toThrow();
      expect(() => frameworkSchema.parse('backbone')).toThrow();
    });
  });
});

describe('Validation Functions', () => {
  describe('validateName', () => {
    it('should accept valid kebab-case names', () => {
      expect(validateName('user-management')).toBe(true);
      expect(validateName('auth-service')).toBe(true);
      expect(validateName('hello')).toBe(true);
      expect(validateName('user123')).toBe(true);
    });

    it('should reject names with uppercase letters', () => {
      expect(validateName('User-Management')).toBe(false);
      expect(validateName('UserManagement')).toBe(false);
    });

    it('should reject names with underscores', () => {
      expect(validateName('user_management')).toBe(false);
    });

    it('should reject names with special characters', () => {
      expect(validateName('user@management')).toBe(false);
      expect(validateName('user!module')).toBe(false);
    });
  });

  describe('validatePath', () => {
    it('should accept valid paths', () => {
      expect(validatePath('src/modules/user-management')).toBe(true);
      expect(validatePath('lib/core/config.ts')).toBe(true);
      expect(validatePath('test_file.js')).toBe(true);
      expect(validatePath('folder-name/file.ts')).toBe(true);
    });

    it('should reject paths with invalid characters', () => {
      expect(validatePath('src/modules/@user')).toBe(false);
      expect(validatePath('lib/core!config')).toBe(false);
    });
  });

  describe('validateModuleName', () => {
    it('should accept valid module names', () => {
      expect(validateModuleName('user-management')).toBe(true);
      expect(validateModuleName('auth-service')).toBe(true);
    });

    it('should accept scoped module names', () => {
      expect(validateModuleName('@company/user-management')).toBe(true);
      expect(validateModuleName('@org/auth-service')).toBe(true);
    });

    it('should reject invalid scoped names', () => {
      expect(validateModuleName('@company')).toBe(false);
      expect(validateModuleName('@company/user/extra')).toBe(false);
      expect(validateModuleName('@')).toBe(false);
    });

    it('should reject invalid module names', () => {
      expect(validateModuleName('User-Management')).toBe(false);
      expect(validateModuleName('user_management')).toBe(false);
    });
  });

  describe('validateModuleNameStrict', () => {
    it('should not throw for valid module names', () => {
      expect(() => validateModuleNameStrict('user-management')).not.toThrow();
      expect(() => validateModuleNameStrict('auth-service')).not.toThrow();
    });

    it('should throw ValidationError for invalid module names', () => {
      expect(() => validateModuleNameStrict('User-Management')).toThrow(
        ValidationError
      );
      expect(() => validateModuleNameStrict('user_management')).toThrow(
        ValidationError
      );
      expect(() => validateModuleNameStrict('a')).toThrow(ValidationError);
    });

    it('should include error details in ValidationError', () => {
      try {
        validateModuleNameStrict('User-Management');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.details).toBeDefined();
          expect(error.details?.name).toBe('User-Management');
        }
      }
    });
  });

  describe('validateComponentName', () => {
    it('should accept valid PascalCase component names when convention is PascalCase', () => {
      expect(validateComponentName('UserCard', 'PascalCase')).toBe(true);
      expect(validateComponentName('LoginForm', 'PascalCase')).toBe(true);
    });

    it('should reject camelCase component names when convention is PascalCase', () => {
      expect(validateComponentName('userCard', 'PascalCase')).toBe(false);
    });

    it('should accept valid kebab-case names when convention is kebab-case', () => {
      expect(validateComponentName('user-card', 'kebab-case')).toBe(true);
      expect(validateComponentName('login-form', 'kebab-case')).toBe(true);
    });

    it('should use kebab-case as default convention', () => {
      expect(validateComponentName('user-card')).toBe(true);
      expect(validateComponentName('UserCard')).toBe(false);
    });
  });

  describe('validateComponentNameStrict', () => {
    it('should not throw for valid PascalCase component names', () => {
      expect(() => validateComponentNameStrict('UserCard')).not.toThrow();
      expect(() => validateComponentNameStrict('LoginForm')).not.toThrow();
    });

    it('should throw ValidationError for invalid component names', () => {
      expect(() => validateComponentNameStrict('userCard')).toThrow(
        ValidationError
      );
      expect(() => validateComponentNameStrict('user-card')).toThrow(
        ValidationError
      );
      expect(() => validateComponentNameStrict('A')).toThrow(ValidationError);
    });

    it('should include error details in ValidationError', () => {
      try {
        validateComponentNameStrict('userCard');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.details).toBeDefined();
          expect(error.details?.name).toBe('userCard');
        }
      }
    });
  });

  describe('validateFramework', () => {
    it('should accept valid framework names', () => {
      expect(validateFramework('nextjs')).toBe('nextjs');
      expect(validateFramework('react')).toBe('react');
      expect(validateFramework('vue')).toBe('vue');
    });

    it('should accept framework names with different casing', () => {
      expect(validateFramework('NextJS')).toBe('nextjs');
      expect(validateFramework('REACT')).toBe('react');
      expect(validateFramework('VUE')).toBe('vue');
    });

    it('should throw ValidationError for invalid frameworks', () => {
      expect(() => validateFramework('invalid')).toThrow(ValidationError);
      expect(() => validateFramework('ember')).toThrow(ValidationError);
    });

    it('should include supported frameworks in error details', () => {
      try {
        validateFramework('invalid');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.details).toBeDefined();
          expect(error.details?.framework).toBe('invalid');
          expect(error.details?.supported).toBeDefined();
        }
      }
    });
  });

  describe('validateFileExtension', () => {
    it('should accept valid file extensions', () => {
      expect(validateFileExtension('.ts')).toBe(true);
      expect(validateFileExtension('.js')).toBe(true);
      expect(validateFileExtension('.tsx')).toBe(true);
      expect(validateFileExtension('.vue')).toBe(true);
    });

    it('should reject invalid file extensions', () => {
      expect(validateFileExtension('ts')).toBe(false);
      expect(validateFileExtension('.ts!')).toBe(false);
      expect(validateFileExtension('.')).toBe(false);
    });
  });
});

describe('Case Conversion Functions', () => {
  describe('toPascalCase', () => {
    it('should convert kebab-case to PascalCase', () => {
      expect(toPascalCase('user-management')).toBe('UserManagement');
      expect(toPascalCase('auth-service')).toBe('AuthService');
      expect(toPascalCase('api-client')).toBe('ApiClient');
    });

    it('should handle single words', () => {
      expect(toPascalCase('user')).toBe('User');
      expect(toPascalCase('button')).toBe('Button');
    });

    it('should handle multiple hyphens', () => {
      expect(toPascalCase('very-long-module-name')).toBe('VeryLongModuleName');
    });
  });

  describe('toCamelCase', () => {
    it('should convert kebab-case to camelCase', () => {
      expect(toCamelCase('user-management')).toBe('userManagement');
      expect(toCamelCase('auth-service')).toBe('authService');
      expect(toCamelCase('api-client')).toBe('apiClient');
    });

    it('should handle single words', () => {
      expect(toCamelCase('user')).toBe('user');
      expect(toCamelCase('button')).toBe('button');
    });
  });

  describe('toKebabCase', () => {
    it('should convert PascalCase to kebab-case', () => {
      expect(toKebabCase('UserManagement')).toBe('user-management');
      expect(toKebabCase('AuthService')).toBe('auth-service');
      expect(toKebabCase('APIClient')).toBe('apiclient'); // Consecutive capitals don't split
    });

    it('should convert camelCase to kebab-case', () => {
      expect(toKebabCase('userManagement')).toBe('user-management');
      expect(toKebabCase('authService')).toBe('auth-service');
    });

    it('should convert spaces to hyphens', () => {
      expect(toKebabCase('user management')).toBe('user-management');
      expect(toKebabCase('auth service')).toBe('auth-service');
    });

    it('should convert underscores to hyphens', () => {
      expect(toKebabCase('user_management')).toBe('user-management');
      expect(toKebabCase('auth_service')).toBe('auth-service');
    });

    it('should handle already kebab-case strings', () => {
      expect(toKebabCase('user-management')).toBe('user-management');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert kebab-case to snake_case', () => {
      expect(toSnakeCase('user-management')).toBe('user_management');
      expect(toSnakeCase('auth-service')).toBe('auth_service');
      expect(toSnakeCase('api-client')).toBe('api_client');
    });

    it('should handle single words', () => {
      expect(toSnakeCase('user')).toBe('user');
      expect(toSnakeCase('button')).toBe('button');
    });
  });
});
