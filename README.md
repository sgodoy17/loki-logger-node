# loki-logger-node

Lightweight Node.js logger for Grafana Loki — simple, fast, and easy to integrate.

## Installation

```bash
 npm install loki-logger-node
```

## Quick start

```typescript
import { loki } from 'loki-logger-node';

const logger = loki({ name: 'my-service', stage: 'production', url: '[http://loki:3100](http://loki:3100)', pattern: 'default' });

logger.info('Bootstrap', 'Application started');

await logger.flush();
```

## API

### `loki(config)`

Creates or returns a logger instance.

```typescript
const logger = loki({ name: 'my-service', stage: 'production', url: '[http://loki:3100](http://loki:3100)' });
```

## Configuration

```typescript
type Mask = {
  prefix?: number;
  suffix?: number;
  length?: number;
  character?: string;
  type?: 'default' | 'email';
};

type LokiSetting = {
  url: string | URL;
  name: string;
  stage?: string;
  pattern?: string;
  job?: string;
  headers?: Record<string, string>;
  mask?: {
    enabled?: boolean;
    fields?: Record<string, Mask>;
  };
};
```

| Option | Required | Description |
|---|---:|---|
| `url` | Yes | Base Loki URL, for example `http://loki:3100` or `https://loki.example.com` |
| `name` | Yes | Service/application name sent as the `lambda_name` Loki label |
| `stage` | No | Environment/stage sent as the `env` Loki label |
| `pattern` | No | Log pattern sent as the `log_pattern` Loki label |
| `job` | No | Loki `job` label. Defaults to `lambda_logs` |
| `headers` | No | Custom HTTP headers for auth or tenancy |
| `mask` | No | Masks sensitive fields before logs are written to stdout and sent to Loki |

### HTTPS Loki endpoint

```typescript
import { loki } from 'loki-logger-node';

const logger = loki({ name: 'my-service', stage: 'production', url: '[https://loki.example.com](https://loki.example.com)' });

logger.info('Bootstrap', 'Application started');

await logger.flush();
```

### Custom headers and authentication

```typescript
import { loki } from 'loki-logger-node';

const logger = loki({ name: 'my-service', stage: 'production', url: '[https://loki.example.com](https://loki.example.com)', headers: { Authorization: `Bearer ${process.env.LOKI_TOKEN}`, 'X-Scope-OrgID': 'my-tenant' } });

logger.info('Bootstrap', 'Application started');

await logger.flush();
```

## Logger methods

```typescript
logger.trace(context, message, ...params);
logger.debug(context, message, ...params);
logger.info(context, message, ...params);
logger.warn(context, message, ...params);
logger.error(context, message, ...params);
logger.fatal(context, message, ...params);
```

### Example:

```typescript
logger.info('UserService', 'User created', { userId: '123' });
```

Optional params are included in the JSON log body, not as Loki labels.

## Sending logs

Logs are queued in memory until flushed.

```typescript
await logger.flush();
```

## Data masking

Sensitive fields can be masked before being written to stdout and sent to Loki.

```typescript
import { loki } from 'loki-logger-node';

const logger = loki({
  name: 'my-service',
  url: 'http://loki:3100',
  mask: {
    enabled: true,
    fields: {
      pcs: {
        prefix: 3,
        suffix: 3,
      },
      token: {
        prefix: 4,
        suffix: 4,
      },
      password: {
        length: 8,
      },
      email: {
        type: 'email',
      },
    },
  },
});
```

### Mask options

| Option | Default | Description |
|---|---:|---|
| `prefix` | `3` | Number of characters to keep at the beginning |
| `suffix` | `3` | Number of characters to keep at the end |
| `length` | Original length | Fixed number of masking characters |
| `character` | `*` | Character used for masking |
| `type` | `default` | Built-in masking strategy (`default` or `email`) |

### Object example

```typescript
logger.info('UserService', 'User created', {
  pcs: '56972498549',
  token: 'abcdefghijklmnop',
  password: 'mySecretPassword',
  email: 'john.doe@gmail.com',
});
```

Produces:

```json
{
  "pcs": "569*****549",
  "token": "abcd********ijkl",
  "password": "********",
  "email": "j*******@gmail.com"
}
```

### String example

The logger also masks configured fields inside string messages.

```typescript
logger.info(
  'UserService',
  'Created user with pcs: 56972498549 and email: john.doe@gmail.com'
);
```

Produces:

```text
Created user with pcs: 569*****549 and email: j*******@gmail.com
```

Supported formats include:

```text
pcs: 56972498549
pcs = 56972498549

email: john.doe@gmail.com
email = john.doe@gmail.com
```
