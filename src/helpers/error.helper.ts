import { GeneralException } from '../exceptions';

export class ErrorHelper {
  public static quickError(message: string): void {
    throw new GeneralException(message);
  }
}
