/**
 * Validates if a name is in kebab-case format
 */
export function validateName(name: string): boolean {
  // Check if name is in kebab-case (lowercase with hyphens)
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)
}

/**
 * Validates if a path is valid
 */
export function validatePath(path: string): boolean {
  // Basic path validation
  return /^[a-zA-Z0-9/\-_.]+$/.test(path)
}

/**
 * Converts kebab-case to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Converts kebab-case to camelCase
 */
export function toCamelCase(str: string): string {
  const pascalCase = toPascalCase(str)
  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1)
}

/**
 * Converts any case to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * Converts kebab-case to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/-/g, '_')
}

/**
 * Validates module name (allows for scoped names)
 */
export function validateModuleName(name: string): boolean {
  // Allow scoped names like @scope/module-name
  if (name.startsWith('@')) {
    const parts = name.split('/')
    if (parts.length !== 2) return false
    const scope = parts[0].slice(1) // remove @
    const moduleName = parts[1]
    return validateName(scope) && validateName(moduleName)
  }
  return validateName(name)
}

/**
 * Validates component name (PascalCase or kebab-case)
 */
export function validateComponentName(name: string, convention: 'PascalCase' | 'kebab-case' = 'kebab-case'): boolean {
  if (convention === 'PascalCase') {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name)
  }
  return validateName(name)
}

/**
 * Validates file extension
 */
export function validateFileExtension(ext: string): boolean {
  return /^\.[a-zA-Z0-9]+$/.test(ext)
}
