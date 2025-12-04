import os from 'os';

import { LogLevel } from '../constants';

export class LokiHelper {
  public static format(level: string, context: string, message: string): unknown {
    return {
      level: LogLevel[level],
      time: Date.now(),
      pid: process.pid,
      hostname: os.hostname(),
      context: context,
      msg: message,
    };
  }
}
