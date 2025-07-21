/**
 * Standardized error handling utilities for consistent error management
 */

export const ErrorLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export type ErrorLevelType = (typeof ErrorLevel)[keyof typeof ErrorLevel];

export interface ErrorContext {
  operation: string;
  details?: Record<string, unknown>;
  timestamp?: Date;
}

export class ErrorHandler {
  /**
   * Log an error with context information
   */
  static logError(
    level: ErrorLevelType,
    message: string,
    context: ErrorContext,
    error?: unknown
  ): void {
    const logEntry = {
      level,
      message,
      context: {
        ...context,
        timestamp: context.timestamp || new Date(),
      },
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };

    // Use appropriate console method based on level
    switch (level) {
      case ErrorLevel.INFO:
        console.info('[INFO]', logEntry);
        break;
      case ErrorLevel.WARN:
        console.warn('[WARN]', logEntry);
        break;
      case ErrorLevel.ERROR:
        console.error('[ERROR]', logEntry);
        break;
      case ErrorLevel.CRITICAL:
        console.error('[CRITICAL]', logEntry);
        break;
    }
  }

  /**
   * Handle async operation errors with standard logging
   */
  static async handleAsyncError<T>(
    operation: string,
    asyncFn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await asyncFn();
    } catch (error) {
      this.logError(
        ErrorLevel.ERROR,
        `Async operation failed: ${operation}`,
        { operation },
        error
      );
      return fallback;
    }
  }

  /**
   * Handle file loading errors
   */
  static handleFileError(
    filename: string,
    error: unknown,
    context: 'loading' | 'serving' | 'processing' = 'loading'
  ): void {
    this.logError(
      ErrorLevel.ERROR,
      `File ${context} failed`,
      {
        operation: `file_${context}`,
        details: { filename },
      },
      error
    );
  }

  /**
   * Handle navigation errors with fallback location
   */
  static handleNavigationError(
    error: unknown,
    fallbackUsed: boolean = false
  ): void {
    this.logError(
      ErrorLevel.WARN,
      'Navigation failed, using fallback',
      {
        operation: 'navigation',
        details: { fallbackUsed },
      },
      error
    );
  }

  /**
   * Handle DOM element not found errors
   */
  static handleDOMError(selector: string): never {
    const error = new Error(`DOM element not found: ${selector}`);
    this.logError(
      ErrorLevel.CRITICAL,
      'Required DOM element missing',
      {
        operation: 'dom_query',
        details: { selector },
      },
      error
    );
    throw error;
  }

  /**
   * Handle server API errors
   */
  static handleAPIError(
    endpoint: string,
    status: number,
    error: unknown
  ): void {
    this.logError(
      ErrorLevel.ERROR,
      `API request failed: ${endpoint}`,
      {
        operation: 'api_request',
        details: { endpoint, status },
      },
      error
    );
  }

  /**
   * Validate and handle seed input errors
   */
  static validateSeed(input: string): number | null {
    if (input.trim() === '') {
      return null;
    }

    const seed = parseInt(input, 10);
    if (isNaN(seed)) {
      this.logError(ErrorLevel.WARN, 'Invalid seed input provided', {
        operation: 'seed_validation',
        details: { input },
      });
      return null;
    }

    return seed;
  }

  /**
   * Handle feature loading errors for FlatGeobuf
   */
  static handleFeatureLoadError(
    url: string,
    error: unknown,
    stage: 'start' | 'end' | 'error'
  ): void {
    const level = stage === 'error' ? ErrorLevel.ERROR : ErrorLevel.INFO;
    this.logError(
      level,
      `Feature loading ${stage}: ${url}`,
      {
        operation: 'feature_loading',
        details: { url, stage },
      },
      stage === 'error' ? error : undefined
    );
  }
}
