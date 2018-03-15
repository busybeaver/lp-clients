import { ILogger, ILoggerFactory } from "@lp-libs/logger";
import chalk, { Chalk, ColorSupport } from "chalk";

/**
 * A logger implementation using simple console logging.
 */
export class ConsoleLogger implements ILogger {

  constructor(private readonly name: string) { }

  public verbose(message?: any, ...optionalParams: any[]): void {
    // there is no verbose level in the console object
    this.log(console.log, chalk.grey, message, ...optionalParams);
  }
  public debug(message?: any, ...optionalParams: any[]): void {
    // the debug function of the console object is an alias for the log function
    // https://nodejs.org/api/console.html#console_console_debug_data_args
    this.log(console.log, chalk.white, message, ...optionalParams);
  }
  public info(message?: any, ...optionalParams: any[]): void {
    this.log(console.info, chalk.whiteBright, message, ...optionalParams);
  }
  public warn(message?: any, ...optionalParams: any[]): void {
    this.log(console.warn, chalk.yellow, message, ...optionalParams);
  }
  public error(message?: any, ...optionalParams: any[]): void {
    this.log(console.error, chalk.red, message, ...optionalParams);
  }
  private log(logFn, color: Chalk, message?: any, ...optionalParams: any[]): void {
    process.stdout.write(color(`[${this.name}] `));
    const args = [message, ...optionalParams].map((arg) => typeof arg === "string" ? color(arg) : arg);
    Reflect.apply(logFn, null, args);
  }
}

/**
 * A logger factory which returns console logger instances.
 */
export class ConsoleLoggerFactory implements ILoggerFactory {
  public create(name: string): ILogger {
    return new ConsoleLogger(name);
  }
}
