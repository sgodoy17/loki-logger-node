import { request as http } from 'node:http';
import { request as https } from 'node:https';

import { GeneralException } from '../exceptions';
import { DateTimeHelper, ErrorHelper, LokiHelper } from '../helpers';
import { Level, LokiSetting, LokiStream } from '../types';

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

  public async flush(): Promise<void> {
    const streams = Object.values(this.streams);

    if (streams.length === 0) {
      return;
    }

    const payload = JSON.stringify({ streams });

    this.streams = {};

    try {
      const { hostname, port, pathname, protocol } = new URL('loki/api/v1/push', this.config.url);
      const request = protocol === 'https:' ? https : http;
      const length = Buffer.byteLength(payload);
      const timeout = length / 1024 / 1024 > 0.5 ? 3_000 : 1_000;

      await new Promise<void>((resolve, reject) => {
        const client = request({
          hostname,
          port,
          path: pathname,
          method: 'POST',
          headers: {
            ...this.config.headers,
            'Content-Type': 'application/json',
            'Content-Length': length,
          },
          timeout,
          signal: AbortSignal.timeout(timeout),
        });

        client.on('response', response => {
          if (response.statusCode && response.statusCode >= 400) {
            reject(new GeneralException(`Loki rejected logs: ${response.statusCode}`));
          } else {
            resolve();
          }
        });

        client.on('timeout', () => {
          client.destroy();

          reject(new GeneralException('Loki request timed out'));
        });

        client.on('error', error => {
          reject(error);
        });

        client.write(payload);
        client.end();
      });
    } catch (error: unknown) {
      const message = `Got an error when trying to send log to Loki, error output: ${JSON.stringify(ErrorHelper.serialize(error))}`;

      process.stdout.write(`${JSON.stringify(LokiHelper.format('fatal', '', message))}\n`);
    }
  }

  private entry(level: Level, context: string, message: string, params?: unknown[]): void {
    const content = JSON.stringify(LokiHelper.format(level, context, message, params));

    process.stdout.write(`${content}\n`);

    if (!this.streams[level]) {
      this.streams[level] = {
        stream: {
          job: this.config.job ?? 'lambda_logs',
          env: this.config.stage ?? 'development',
          lambda_name: this.config.name,
          level,
          log_pattern: this.config.pattern ?? 'default',
        },
        values: [],
      };
    }

    this.streams[level].values.push([DateTimeHelper.getTimestamp(), content]);
  }
}
