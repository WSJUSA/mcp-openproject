// Comprehensive logging utility for OpenProject MCP Server

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private enableFileLogging: boolean;
  private logFile?: string;

  private constructor() {
    // Set log level from environment variable
    const envLogLevel = process.env['MCP_LOG_LEVEL']?.toUpperCase();
    this.logLevel = LogLevel[envLogLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
    
    // Enable file logging if specified
    this.enableFileLogging = process.env['MCP_ENABLE_FILE_LOGGING'] === 'true';
    this.logFile = process.env['MCP_LOG_FILE'] || 'mcp-openproject.log';
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setLogFile(logFile: string): void {
    this.logFile = logFile;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  private writeLog(level: LogLevel, levelName: string, message: string, context?: any): void {
    if (level < this.logLevel) return;

    const formattedMessage = this.formatMessage(levelName, message, context);
    
    // Always write to stderr for MCP compatibility
    console.error(formattedMessage);

    // Optionally write to file
    if (this.enableFileLogging && this.logFile) {
      try {
        const fs = require('fs');
        fs.appendFileSync(this.logFile, formattedMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  debug(message: string, context?: any): void {
    this.writeLog(LogLevel.DEBUG, 'DEBUG', message, context);
  }

  info(message: string, context?: any): void {
    this.writeLog(LogLevel.INFO, 'INFO', message, context);
  }

  warn(message: string, context?: any): void {
    this.writeLog(LogLevel.WARN, 'WARN', message, context);
  }

  error(message: string, context?: any): void {
    this.writeLog(LogLevel.ERROR, 'ERROR', message, context);
  }

  // Special methods for API debugging
  logApiRequest(method: string, url: string, headers?: any, body?: any): void {
    this.debug(`API Request: ${method} ${url}`, {
      headers: this.sanitizeHeaders(headers),
      body: body ? JSON.stringify(body, null, 2) : undefined
    });
  }

  logApiResponse(method: string, url: string, status: number, headers?: any, body?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    const levelName = status >= 400 ? 'ERROR' : 'DEBUG';
    
    this.writeLog(level, levelName, `API Response: ${method} ${url} - Status: ${status}`, {
      headers: this.sanitizeHeaders(headers),
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body, null, 2)) : undefined
    });
  }

  logSchemaValidation(toolName: string, data: any, error?: any): void {
    if (error) {
      this.error(`Schema validation failed for ${toolName}`, {
        error: error.message || error,
        data: JSON.stringify(data, null, 2),
        dataType: typeof data,
        dataKeys: typeof data === 'object' && data ? Object.keys(data) : undefined
      });
    } else {
      this.debug(`Schema validation passed for ${toolName}`, {
        dataType: typeof data,
        dataKeys: typeof data === 'object' && data ? Object.keys(data) : undefined
      });
    }
  }

  logToolExecution(toolName: string, args: any, startTime: number, result?: any, error?: any): void {
    const duration = Date.now() - startTime;
    
    if (error) {
      this.error(`Tool execution failed: ${toolName} (${duration}ms)`, {
        args,
        error: error.message || error,
        stack: error.stack
      });
    } else {
      this.info(`Tool execution completed: ${toolName} (${duration}ms)`, {
        args,
        resultType: typeof result,
        resultKeys: typeof result === 'object' && result ? Object.keys(result) : undefined
      });
    }
  }

  private sanitizeHeaders(headers?: any): any {
    if (!headers) return undefined;
    
    const sanitized = { ...headers };
    // Remove sensitive information
    if (sanitized.authorization) sanitized.authorization = '[REDACTED]';
    if (sanitized.Authorization) sanitized.Authorization = '[REDACTED]';
    if (sanitized['x-api-key']) sanitized['x-api-key'] = '[REDACTED]';
    if (sanitized['X-API-Key']) sanitized['X-API-Key'] = '[REDACTED]';
    
    return sanitized;
  }

  // Method to log raw data for debugging
  logRawData(label: string, data: any): void {
    this.debug(`Raw Data - ${label}`, {
      data: JSON.stringify(data, null, 2),
      type: typeof data,
      constructor: data?.constructor?.name,
      keys: typeof data === 'object' && data ? Object.keys(data) : undefined,
      length: Array.isArray(data) ? data.length : undefined
    });
  }
}

// Helper function to parse log level from string
export function parseLogLevel(level: string | undefined): LogLevel {
  if (!level) return LogLevel.INFO;
  
  const upperLevel = level.toUpperCase();
  switch (upperLevel) {
    case 'DEBUG': return LogLevel.DEBUG;
    case 'INFO': return LogLevel.INFO;
    case 'WARN': return LogLevel.WARN;
    case 'ERROR': return LogLevel.ERROR;
    default: return LogLevel.INFO;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();