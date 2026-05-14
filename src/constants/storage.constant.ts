import { AsyncLocalStorage } from 'node:async_hooks';

import { Store } from '../entities';

export const Storage = new AsyncLocalStorage<Store>();
