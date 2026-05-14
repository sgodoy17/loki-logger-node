export class DateTimeHelper {
  public static getTimestamp(): string {
    return String(BigInt(Date.now()) * 1_000_000n + BigInt(process.hrtime()[1]));
  }
}
