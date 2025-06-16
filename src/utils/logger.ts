import chalk from "chalk"

/**
 * Log a success message
 */
export function logSuccess(message: string): void {
  console.log(chalk.green("✓ ") + message)
}

/**
 * Log an error message
 */
export function logError(message: string): void {
  console.log(chalk.red("✗ ") + message)
}

/**
 * Log an info message
 */
export function logInfo(message: string): void {
  console.log(chalk.blue("ℹ ") + message)
}

/**
 * Log a warning message
 */
export function logWarning(message: string): void {
  console.log(chalk.yellow("⚠ ") + message)
}
