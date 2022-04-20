import * as bunyan from 'bunyan';

export type Logger = {
  child(options: Object, simple?: boolean): Logger;

  /**
   * Returns a boolean: is the `trace` level enabled?
   *
   * This is equivalent to `log.isTraceEnabled()` or `log.isEnabledFor(TRACE)` in log4j.
   */
  trace(): boolean;

  /**
   * Special case to log an `Error` instance to the record.
   * This adds an `err` field with exception details
   * (including the stack) and sets `msg` to the exception
   * message or you can specify the `msg`.
   */
  trace(error: Error, ...parameters: any[]): void;

  /**
   * The first field can optionally be a "fields" object, which
   * is merged into the log record.
   *
   * To pass in an Error *and* other fields, use the `err`
   * field name for the Error instance.
   */
  trace(object: Object, ...parameters: any[]): void;

  /**
   * Uses `util.format` for msg formatting.
   */
  trace(format: any, ...parameters: any[]): void;

  /**
   * Returns a boolean: is the `debug` level enabled?
   *
   * This is equivalent to `log.isDebugEnabled()` or `log.isEnabledFor(DEBUG)` in log4j.
   */
  debug(): boolean;

  /**
   * Special case to log an `Error` instance to the record.
   * This adds an `err` field with exception details
   * (including the stack) and sets `msg` to the exception
   * message or you can specify the `msg`.
   */
  debug(error: Error, ...parameters: any[]): void;

  /**
   * The first field can optionally be a "fields" object, which
   * is merged into the log record.
   *
   * To pass in an Error *and* other fields, use the `err`
   * field name for the Error instance.
   */
  debug(object: Object, ...parameters: any[]): void;

  /**
   * Uses `util.format` for msg formatting.
   */
  debug(format: any, ...parameters: any[]): void;

  /**
   * Returns a boolean: is the `info` level enabled?
   *
   * This is equivalent to `log.isInfoEnabled()` or `log.isEnabledFor(INFO)` in log4j.
   */
  info(): boolean;

  /**
   * Special case to log an `Error` instance to the record.
   * This adds an `err` field with exception details
   * (including the stack) and sets `msg` to the exception
   * message or you can specify the `msg`.
   */
  info(error: Error, ...parameters: any[]): void;

  /**
   * The first field can optionally be a "fields" object, which
   * is merged into the log record.
   *
   * To pass in an Error *and* other fields, use the `err`
   * field name for the Error instance.
   */
  info(object: Object, ...parameters: any[]): void;

  /**
   * Uses `util.format` for msg formatting.
   */
  info(format: any, ...parameters: any[]): void;

  /**
   * Returns a boolean: is the `warn` level enabled?
   *
   * This is equivalent to `log.isWarnEnabled()` or `log.isEnabledFor(WARN)` in log4j.
   */
  warn(): boolean;

  /**
   * Special case to log an `Error` instance to the record.
   * This adds an `err` field with exception details
   * (including the stack) and sets `msg` to the exception
   * message or you can specify the `msg`.
   */
  warn(error: Error, ...parameters: any[]): void;

  /**
   * The first field can optionally be a "fields" object, which
   * is merged into the log record.
   *
   * To pass in an Error *and* other fields, use the `err`
   * field name for the Error instance.
   */
  warn(object: Object, ...parameters: any[]): void;

  /**
   * Uses `util.format` for msg formatting.
   */
  warn(format: any, ...parameters: any[]): void;

  /**
   * Returns a boolean: is the `error` level enabled?
   *
   * This is equivalent to `log.isErrorEnabled()` or `log.isEnabledFor(ERROR)` in log4j.
   */
  error(): boolean;

  /**
   * Special case to log an `Error` instance to the record.
   * This adds an `err` field with exception details
   * (including the stack) and sets `msg` to the exception
   * message or you can specify the `msg`.
   */
  error(error: Error, ...parameters: any[]): void;

  /**
   * The first field can optionally be a "fields" object, which
   * is merged into the log record.
   *
   * To pass in an Error *and* other fields, use the `err`
   * field name for the Error instance.
   */
  error(object: Object, ...parameters: any[]): void;

  /**
   * Uses `util.format` for msg formatting.
   */
  error(format: any, ...parameters: any[]): void;

  /**
   * Returns a boolean: is the `fatal` level enabled?
   *
   * This is equivalent to `log.isFatalEnabled()` or `log.isEnabledFor(FATAL)` in log4j.
   */
  fatal(): boolean;

  /**
   * Special case to log an `Error` instance to the record.
   * This adds an `err` field with exception details
   * (including the stack) and sets `msg` to the exception
   * message or you can specify the `msg`.
   */
  fatal(error: Error, ...parameters: any[]): void;

  /**
   * The first field can optionally be a "fields" object, which
   * is merged into the log record.
   *
   * To pass in an Error *and* other fields, use the `err`
   * field name for the Error instance.
   */
  fatal(object: Object, ...parameters: any[]): void;

  /**
   * Uses `util.format` for msg formatting.
   */
  fatal(format: any, ...parameters: any[]): void;
};

function isLogLevel(level: string): level is bunyan.LogLevelString {
  if (['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(level)) {
    return true;
  }

  return false;
}

const LOG_LEVEL = process.env.LOG_LEVEL || '';
const logLevel: bunyan.LogLevelString = isLogLevel(LOG_LEVEL) ? LOG_LEVEL : 'debug';

export const rootLogger: Logger = bunyan.createLogger({
  name: 'kin-send-looger',
  level: logLevel,
});
