# loki-logger-node

Lightweight Node.js logger for Grafana Loki — simple, fast, and easy to integrate.

## Installation

```bash
 npm install loki-logger-node
```

## Quick start

```typescript
import { loki } from 'loki-logger-node';

const logger = loki({ name: 'my-service', stage: 'production', url: '[http://loki:3100](http://loki:3100)', pattern: 'default', });

logger.info('Bootstrap', 'Application started');

await logger.flush();
```

## API

### `loki(config)`

Creates or returns a logger instance.

```typescript
const logger = loki({ name: 'my-service', stage: 'production', url: '[http://loki:3100](http://loki:3100)', });
```

## Configuration

```typescript
type LokiSetting = { url: string | URL; name: string; stage?: string; pattern?: string; job?: string; headers?: Record<string, string>; };
```

| Option | Required | Description |
|---|---:|---|
| `url` | Yes | Base Loki URL, for example `http://loki:3100` or `https://loki.example.com` |
| `name` | Yes | Service/application name sent as the `lambda_name` Loki label |
| `stage` | No | Environment/stage sent as the `env` Loki label |
| `pattern` | No | Log pattern sent as the `log_pattern` Loki label |
| `job` | No | Loki `job` label. Defaults to `lambda_logs` |
| `headers` | No | Custom HTTP headers for auth or tenancy |

### HTTPS Loki endpoint

```typescript
import { loki } from 'loki-logger-node';

const logger = loki({ name: 'my-service', stage: 'production', url: '[https://loki.example.com](https://loki.example.com)', });

logger.info('Bootstrap', 'Application started');

await logger.flush();
```

### Custom headers and authentication

```typescript
import { loki } from 'loki-logger-node';

const logger = loki({ name: 'my-service', stage: 'production', url: '[https://loki.example.com](https://loki.example.com)', headers: { Authorization: `Bearer ${process.env.LOKI_TOKEN}`, 'X-Scope-OrgID': 'my-tenant', }, });

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

For backward compatibility, `execute()` is also available:
