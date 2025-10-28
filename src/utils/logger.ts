import chalk from 'chalk';
import ora, { type Ora } from 'ora';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private spinner: Ora | null = null;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.blue(`ℹ ${message}`));
    }
  }

  success(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.green(`✓ ${message}`));
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(chalk.yellow(`⚠ ${message}`));
    }
  }

  error(message: string, error?: Error): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(chalk.red(`✖ ${message}`));
      if (error?.stack && process.env.DEBUG) {
        console.error(chalk.red(error.stack));
      }
    }
  }

  startSpinner(text: string): void {
    if (this.level <= LogLevel.INFO) {
      this.spinner = ora(text).start();
    }
  }

  updateSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }

  succeedSpinner(text?: string): void {
    if (this.spinner) {
      this.spinner.succeed(text);
      this.spinner = null;
    }
  }

  failSpinner(text?: string): void {
    if (this.spinner) {
      this.spinner.fail(text);
      this.spinner = null;
    }
  }

  stopSpinner(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}

export const logger = new Logger();

// Legacy exports for backward compatibility
export function logSuccess(message: string): void {
  logger.success(message);
}

export function logError(message: string): void {
  logger.error(message);
}

export function logInfo(message: string): void {
  logger.info(message);
}

export function logWarning(message: string): void {
  logger.warn(message);
}

export function logDebug(message: string): void {
  logger.debug(message);
}
