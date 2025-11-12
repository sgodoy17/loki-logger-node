import os from 'os';

import { LogLevel } from '../constants';

export class LokiHelper {
  /**
   * Formats a log entry with metadata such as timestamp, process ID, and hostname.
   *
   * @param {string} level - The log level key (e.g. `"INFO"`, `"ERROR"`, `"DEBUG"`).
   * @param {string} context - The logical source or context of the log message, typically the module or class name.
   * @param {string} message - The message to log.
   * @returns {unknown} A structured log object containing: level, time, pid, hostname, context, and msg.
   */
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
