import { LokiSetting, Mask } from '../types';

export class MaskProcessor {
  constructor(private readonly options?: LokiSetting['mask']) {}

  public mask<T>(value: T): T {
    if (!this.options?.enabled || !this.options.fields) {
      return value;
    }

    return this.walk(value) as T;
  }

  private walk(value: unknown): unknown {
    if (value == null) {
      return value;
    }

    if (typeof value === 'string') {
      return this.maskString(value);
    }

    if (Array.isArray(value)) {
      return value.map(v => this.walk(v));
    }

    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(value)) {
        const config = this.options?.fields?.[key];

        if (config && typeof val === 'string') {
          result[key] = this.maskValue(val, config);
        } else {
          result[key] = this.walk(val);
        }
      }

      return result;
    }

    return value;
  }

  private maskString(message: string): string {
    let result = message;

    for (const [field, config] of Object.entries(this.options?.fields ?? {})) {
      const regex = new RegExp(`(${field}\\s*[:=-]\\s*)([^,\\s]+)`, 'gi');

      result = result.replace(regex, (_, prefix: number, value: string) => {
        return prefix + this.maskValue(value, config);
      });
    }

    return result;
  }

  private maskEmail(email: string): string {
    const at = email.indexOf('@');

    if (at === -1) {
      return this.maskValue(email, { prefix: 1, suffix: 1 });
    }

    const local = email.substring(0, at);
    const domain = email.substring(at + 1);

    if (local.length <= 1) {
      return `*@${domain}`;
    }

    return `${local[0]}${'*'.repeat(local.length - 1)}@${domain}`;
  }

  private maskValue(value: string, config: Mask): string {
    if (config.type === 'email') {
      return this.maskEmail(value);
    }

    const { prefix, suffix, length, character } = {
      prefix: 3,
      suffix: 3,
      length: 0,
      character: '*',
      ...config,
    };

    const start = prefix > 0 ? value.slice(0, prefix) : '';
    const end = suffix > 0 ? value.slice(-suffix) : '';

    const maskLength = length || Math.max(value.length - prefix - suffix, 0);

    return start + character.repeat(maskLength) + end;
  }
}
