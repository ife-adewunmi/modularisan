import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { renderTemplate } from '../template';

describe('Template Utility', () => {
  const testStubsDir = path.join(__dirname, '..', '..', 'stubs');
  const testTemplatePath = path.join(testStubsDir, 'test-template.ejs');

  beforeEach(async () => {
    // Ensure stubs directory exists
    await fs.ensureDir(testStubsDir);
  });

  afterEach(async () => {
    // Clean up test template if it exists
    if (await fs.pathExists(testTemplatePath)) {
      await fs.remove(testTemplatePath);
    }
  });

  describe('renderTemplate', () => {
    it('should render a simple template', async () => {
      const templateContent = 'Hello, <%= name %>!';
      await fs.writeFile(testTemplatePath, templateContent);

      const result = await renderTemplate('test-template.ejs', {
        name: 'World',
      });

      expect(result).toBe('Hello, World!');
    });

    it('should render template with multiple variables', async () => {
      const templateContent = `
export const <%= componentName %> = () => {
  return <div><%= content %></div>;
};
`.trim();
      await fs.writeFile(testTemplatePath, templateContent);

      const result = await renderTemplate('test-template.ejs', {
        componentName: 'MyComponent',
        content: 'Hello!',
      });

      expect(result).toContain('export const MyComponent');
      expect(result).toContain('<div>Hello!</div>');
    });

    it('should render template with loops', async () => {
      const templateContent = `
<% items.forEach(item => { %>
- <%= item %>
<% }) %>
`.trim();
      await fs.writeFile(testTemplatePath, templateContent);

      const result = await renderTemplate('test-template.ejs', {
        items: ['apple', 'banana', 'cherry'],
      });

      expect(result).toContain('- apple');
      expect(result).toContain('- banana');
      expect(result).toContain('- cherry');
    });

    it('should render template with conditionals', async () => {
      const templateContent = `
<% if (useTypeScript) { %>
interface Props {}
<% } else { %>
// No types
<% } %>
`.trim();
      await fs.writeFile(testTemplatePath, templateContent);

      const resultTS = await renderTemplate('test-template.ejs', {
        useTypeScript: true,
      });
      const resultJS = await renderTemplate('test-template.ejs', {
        useTypeScript: false,
      });

      expect(resultTS).toContain('interface Props');
      expect(resultJS).toContain('// No types');
    });

    it('should throw error if template does not exist', async () => {
      await expect(
        renderTemplate('non-existent-template.ejs', {})
      ).rejects.toThrow('Failed to render template: non-existent-template.ejs');
    });

    it('should handle empty data object', async () => {
      const templateContent = 'Static content without variables';
      await fs.writeFile(testTemplatePath, templateContent);

      const result = await renderTemplate('test-template.ejs', {});

      expect(result).toBe('Static content without variables');
    });

    it('should handle template with special characters', async () => {
      const templateContent =
        'Name: <%= name %>, Age: <%= age %>, Email: <%= email %>';
      await fs.writeFile(testTemplatePath, templateContent);

      const result = await renderTemplate('test-template.ejs', {
        name: "John O'Connor",
        age: 30,
        email: 'john@example.com',
      });

      // EJS escapes HTML entities by default
      expect(result).toBe(
        'Name: John O&#39;Connor, Age: 30, Email: john@example.com'
      );
    });

    it('should render nested object properties', async () => {
      const templateContent =
        'User: <%= user.name %>, City: <%= user.address.city %>';
      await fs.writeFile(testTemplatePath, templateContent);

      const result = await renderTemplate('test-template.ejs', {
        user: {
          name: 'Alice',
          address: {
            city: 'New York',
          },
        },
      });

      expect(result).toBe('User: Alice, City: New York');
    });

    it('should handle array data', async () => {
      const templateContent = `
export const items = [
<% items.forEach((item, index) => { %>
  { id: <%= index %>, name: '<%= item %>' }<%= index < items.length - 1 ? ',' : '' %>
<% }) %>
];
`.trim();
      await fs.writeFile(testTemplatePath, templateContent);

      const result = await renderTemplate('test-template.ejs', {
        items: ['First', 'Second', 'Third'],
      });

      expect(result).toContain("{ id: 0, name: 'First' },");
      expect(result).toContain("{ id: 1, name: 'Second' },");
      expect(result).toContain("{ id: 2, name: 'Third' }");
    });
  });
});
