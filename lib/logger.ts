// lib/logger.ts - Centralized logging with environment awareness

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// In production, only log warnings and errors
// In test, suppress all logs
// In development, log everything
const shouldLog = (level: LogLevel): boolean => {
  if (isTest) return false;
  if (isDev) return true;
  return level === 'warn' || level === 'error';
};

const formatMessage = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

export const logger: Logger = {
  debug: (message, ...args) => {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message), ...args);
    }
  },
  info: (message, ...args) => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message), ...args);
    }
  },
  warn: (message, ...args) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message), ...args);
    }
  },
  error: (message, ...args) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message), ...args);
    }
  },
};

// Application-specific loggers
export const apiLogger = {
  request: (method: string, path: string) => logger.debug(`API ${method} ${path}`),
  success: (path: string, duration?: number) => logger.info(`API OK ${path}${duration ? ` (${duration}ms)` : ''}`),
  error: (path: string, error: unknown) => logger.error(`API ERR ${path}: ${error}`),
};

export const dbLogger = {
  query: (model: string, operation: string) => logger.debug(`DB ${model}.${operation}`),
  error: (model: string, error: unknown) => logger.error(`DB ERR ${model}: ${error}`),
};

export const authLogger = {
  login: (email: string, success: boolean) => logger.info(`AUTH: ${email} ${success ? 'logged in' : 'login failed'}`),
  logout: (userId: string) => logger.info(`AUTH: User ${userId} logged out`),
  error: (error: unknown) => logger.error(`AUTH ERR: ${error}`),
};
