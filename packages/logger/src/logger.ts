/**
 * Logger specification for all logger implementations.
 */
export interface ILogger {
  verbose(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

/**
 * A factory for creating logger instances.
 */
export interface ILoggerFactory {
  /**
   * Creates a new logger.
   *
   * @param name The name of the logger, e.g. the class/file name for which the logger will be used.
   * @return A new logger instance.
   */
  create(name: string): ILogger;
}
