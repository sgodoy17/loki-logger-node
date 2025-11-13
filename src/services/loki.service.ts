import { DateTimeHelper, ErrorHelper, LokiHelper } from '../helpers';
import { LokiSetting, LokiStream } from '../types';

export class LokiService {
  private streams: Record<string, LokiStream> = {};

  constructor(public config: LokiSetting) {}

  /**
   * Logs an informational message.
   *
   * @param {string} context - Context or module name associated with the log.
   * @param {string} message - Log message content.
   * @param {...unknown[]} optionalParams - Additional parameters for contextual logging.
   */
  public info(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('info', context, message, optionalParams);
  }

  /**
   * Logs an error message.
   *
   * @param {string} context - Context or module name associated with the log.
   * @param {string} message - Error message content.
   * @param {...unknown[]} optionalParams - Additional error context parameters.
   */
  public error(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('error', context, message, optionalParams);
  }

  /**
   * Logs a warning message.
   *
   * @param {string} context - Context or module name associated with the log.
   * @param {string} message - Warning message content.
   * @param {...unknown[]} optionalParams - Additional warning context parameters.
   */
  public warn(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('warn', context, message, optionalParams);
  }

  /**
   * Logs a debug message.
   *
   * @param {string} context - Context or module name associated with the log.
   * @param {string} message - Debug message content.
   * @param {...unknown[]} optionalParams - Additional debug context parameters.
   */
  public debug(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('debug', context, message, optionalParams);
  }

  /**
   * Logs a trace message.
   *
   * @param {string} context - Context or module name associated with the log.
   * @param {string} message - Trace message content.
   * @param {...unknown[]} optionalParams - Additional trace context parameters.
   */
  public trace(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('trace', context, message, optionalParams);
  }

  /**
   * Logs a fatal message (indicating critical failure).
   *
   * @param {string} context - Context or module name associated with the log.
   * @param {string} message - Fatal error message content.
   * @param {...unknown[]} optionalParams - Additional fatal error context parameters.
   */
  public fatal(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('fatal', context, message, optionalParams);
  }

  /**
   * Updates the Loki service configuration.
   *
   * @param {LokiSetting} config - New Loki configuration.
   * @returns {LokiService} The current LokiService instance for chaining.
   */
  public setConfig(config: LokiSetting): LokiService {
    this.config = config;

    return this;
  }

  /**
   * Sends all buffered logs to the Loki endpoint. After sending, it clears the in-memory log buffer.
   *
   * @throws {Error} Throws if the Loki endpoint returns a non-OK response.
   */
  public async execute(): Promise<void> {
    const payload = { streams: Object.values(this.streams) };

    this.streams = {};

    try {
      const response = await fetch(new URL('loki/api/v1/push', this.config.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        ErrorHelper.quickError(await response.text());
      }
    } catch (error: unknown) {
      const message = `Got an error when trying to send log to Loki, error output: ${JSON.stringify(error)}`;

      process.stdout.write(`${JSON.stringify(LokiHelper.format('fatal', '', message))}\n`);
    }
  }

  private entry(level: string, context: string, message: string, params?: unknown[]): void {
    const content = JSON.stringify(LokiHelper.format(level, context, message));

    process.stdout.write(`${content}\n`);

    if (!this.streams[level]) {
      this.streams[level] = {
        stream: {
          job: this.config.job ?? 'lambda_logs',
          env: this.config.stage ?? 'development',
          lambda_name: this.config.name,
          level,
          log_pattern: this.config.pattern ?? 'default',
          ...params,
        },
        values: [],
      };
    }

    this.streams[level].values.push([DateTimeHelper.getTimestamp(), content]);
  }
}
