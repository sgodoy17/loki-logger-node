import { DateTimeHelper, ErrorHelper, LokiHelper } from '../helpers';
import { LokiSetting, LokiStream } from '../types';

export class LokiService {
  private streams: Record<string, LokiStream> = {};
  private config: LokiSetting;

  constructor(config?: LokiSetting) {
    this.config = config ?? {
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
    };
  }

  public info(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('info', context, message, optionalParams);
  }

  public error(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('error', context, message, optionalParams);
  }

  public warn(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('warn', context, message, optionalParams);
  }

  public debug(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('debug', context, message, optionalParams);
  }

  public trace(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('trace', context, message, optionalParams);
  }

  public fatal(context: string, message: string, ...optionalParams: unknown[]): void {
    this.entry('fatal', context, message, optionalParams);
  }

  public setConfig(config: LokiSetting): LokiService {
    this.config = config;

    return this;
  }

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
