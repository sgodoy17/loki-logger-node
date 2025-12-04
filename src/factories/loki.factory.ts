import { Storage } from '../constants';
import { Store } from '../entities';
import { LokiService } from '../services';
import { Logger, LokiSetting } from '../types';

export const loki = (config?: LokiSetting): Logger => {
  const store = Storage.getStore();

  if (store?.logger) {
    return store.logger;
  }

  const logger = new LokiService(config);

  Storage.enterWith(new Store(logger));

  return logger;
};
