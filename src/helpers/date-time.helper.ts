export class DateTimeHelper {
  /**
   * Get the current timestamp string.
   *
   * @returns {string} The timestamp in milliseconds with microseconds.
   */
  public static getTimestamp(): string {
    return String(BigInt(Date.now()) * 1_000_000n + BigInt(process.hrtime()[1]));
  }
}
