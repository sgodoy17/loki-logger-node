import { GeneralException } from '../exceptions';

export class ErrorHelper {
  /**
   * Throws a generic `GeneralException` with the provided message.
   *
   * @param {string} message - The error message to be included in the thrown `GeneralException`.
   * @throws {GeneralException} Always throws a `GeneralException` with the given message.
   */
  public static quickError(message: string): void {
    throw new GeneralException(message);
  }
}
