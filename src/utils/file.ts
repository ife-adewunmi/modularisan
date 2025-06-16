import fs from "fs-extra"
import path from "path"

/**
 * Ensures that a directory exists, creating it if necessary
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.ensureDir(dirPath)
  } catch (error) {
    throw new Error(`Failed to create directory: ${dirPath}`)
  }
}

/**
 * Checks if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    return await fs.pathExists(filePath)
  } catch (error) {
    return false
  }
}

/**
 * Gets the absolute path from a relative path
 */
export function getAbsolutePath(relativePath: string): string {
  return path.join(process.cwd(), relativePath)
}
