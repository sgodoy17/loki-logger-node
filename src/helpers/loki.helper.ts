import os from 'os';

import { LogLevel } from '../constants';
import { Level } from '../types';

export class LokiHelper {
  public static format(
    level: Level,
    context: string,
    message: string,
    params?: unknown[],
  ): unknown {
    return {
      level: LogLevel[level],
      time: Date.now(),
      pid: process.pid,
      hostname: os.hostname(),
      context: context,
      msg: message,
      ...(params && params.length > 0 ? { params } : {}),
    };
  }
}
