import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import * as path from 'path';
import { ensureDirectoryExists, fileExists, getAbsolutePath } from '../file';

describe('File Utilities', () => {
  const testDir = path.join(__dirname, 'test-fixtures');

  beforeEach(async () => {
    // Clean up test directory before each test
    await fs.remove(testDir);
  });

  afterEach(async () => {
    // Clean up test directory after each test
    await fs.remove(testDir);
  });

  describe('ensureDirectoryExists', () => {
    it('should create a directory if it does not exist', async () => {
      const dirPath = path.join(testDir, 'new-directory');

      await ensureDirectoryExists(dirPath);

      const exists = await fs.pathExists(dirPath);
      expect(exists).toBe(true);
    });

    it('should not throw if directory already exists', async () => {
      const dirPath = path.join(testDir, 'existing-directory');
      await fs.ensureDir(dirPath);

      await expect(ensureDirectoryExists(dirPath)).resolves.not.toThrow();

      const exists = await fs.pathExists(dirPath);
      expect(exists).toBe(true);
    });

    it('should create nested directories', async () => {
      const dirPath = path.join(testDir, 'parent', 'child', 'grandchild');

      await ensureDirectoryExists(dirPath);

      const exists = await fs.pathExists(dirPath);
      expect(exists).toBe(true);
    });

    it('should throw error for invalid paths', async () => {
      // Try to create a directory with invalid characters (on most systems)
      const invalidPath = path.join(testDir, 'invalid\0path');

      await expect(ensureDirectoryExists(invalidPath)).rejects.toThrow();
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      const filePath = path.join(testDir, 'test-file.txt');
      await fs.ensureDir(testDir);
      await fs.writeFile(filePath, 'test content');

      const exists = await fileExists(filePath);

      expect(exists).toBe(true);
    });

    it('should return true if directory exists', async () => {
      const dirPath = path.join(testDir, 'test-directory');
      await fs.ensureDir(dirPath);

      const exists = await fileExists(dirPath);

      expect(exists).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      const filePath = path.join(testDir, 'non-existent-file.txt');

      const exists = await fileExists(filePath);

      expect(exists).toBe(false);
    });

    it('should return false if directory does not exist', async () => {
      const dirPath = path.join(testDir, 'non-existent-directory');

      const exists = await fileExists(dirPath);

      expect(exists).toBe(false);
    });

    it('should handle paths with special characters', async () => {
      const specialDir = path.join(testDir, 'special-chars');
      const filePath = path.join(
        specialDir,
        'file-with-spaces and-special.txt'
      );
      await fs.ensureDir(specialDir);
      await fs.writeFile(filePath, 'content');

      const exists = await fileExists(filePath);

      expect(exists).toBe(true);
    });
  });

  describe('getAbsolutePath', () => {
    it('should convert relative path to absolute path', () => {
      const relativePath = 'src/modules/user-management';
      const absolutePath = getAbsolutePath(relativePath);

      expect(path.isAbsolute(absolutePath)).toBe(true);
      expect(absolutePath).toContain('src/modules/user-management');
    });

    it('should handle paths with ./ prefix', () => {
      const relativePath = './src/modules/user-management';
      const absolutePath = getAbsolutePath(relativePath);

      expect(path.isAbsolute(absolutePath)).toBe(true);
    });

    it('should handle paths with ../ prefix', () => {
      const relativePath = '../modules/user-management';
      const absolutePath = getAbsolutePath(relativePath);

      expect(path.isAbsolute(absolutePath)).toBe(true);
    });

    it('should be based on current working directory', () => {
      const relativePath = 'test';
      const absolutePath = getAbsolutePath(relativePath);
      const expected = path.join(process.cwd(), 'test');

      expect(absolutePath).toBe(expected);
    });

    it('should handle empty string', () => {
      const absolutePath = getAbsolutePath('');
      expect(absolutePath).toBe(process.cwd());
    });

    it('should handle single file name', () => {
      const relativePath = 'test.txt';
      const absolutePath = getAbsolutePath(relativePath);
      const expected = path.join(process.cwd(), 'test.txt');

      expect(absolutePath).toBe(expected);
    });
  });
});
