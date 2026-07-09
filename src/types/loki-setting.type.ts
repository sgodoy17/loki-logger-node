import { Mask } from './mask.type';

export type LokiSetting = {
  url: string | URL;
  name: string;
  stage?: string;
  pattern?: string;
  job?: string;
  headers?: Record<string, string>;
  mask?: { enabled?: boolean; fields?: Record<string, Mask> };
};
