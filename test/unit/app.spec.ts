import * as http from 'node:http';
import * as https from 'node:https';

import { Logger, loki } from '../../src';

const client = {
  on: jest.fn().mockReturnThis(),
  write: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  destroy: jest.fn().mockReturnThis(),
};

jest.mock('node:http', () => ({
  request: jest.fn(),
}));

jest.mock('node:https', () => ({
  request: jest.fn(),
}));

describe('AppHandler test suite', () => {
  beforeEach(() => {
    (http.request as jest.MockedFunction<typeof http.request>).mockImplementation(() => {
      process.nextTick(() => {
        const response = client.on.mock.calls.find(
          ([event]: [string, ...unknown[]]) => event === 'response',
        ) as [string, (res: { statusCode: number }) => void] | undefined;

        response?.[1]({ statusCode: 204 });
      });
      return client as unknown as http.ClientRequest;
    });

    (https.request as jest.MockedFunction<typeof https.request>).mockImplementation(() => {
      process.nextTick(() => {
        const response = client.on.mock.calls.find(
          ([event]: [string, ...unknown[]]) => event === 'response',
        ) as [string, (res: { statusCode: number }) => void] | undefined;

        response?.[1]({ statusCode: 204 });
      });
      return client as unknown as http.ClientRequest;
    });
  });

  it('should call logger.info once with correct arguments', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
    });

    const spy = jest.spyOn(logger, 'info');

    logger.info('test', 'test message');

    await logger.flush();

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test', 'test message');
  });

  it('should call logger.error once with correct arguments', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
    });

    const spy = jest.spyOn(logger, 'error');

    logger.error('test', 'test message');

    await logger.flush();

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test', 'test message');
  });

  it('should call logger.warn once with correct arguments', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
    });

    const spy = jest.spyOn(logger, 'warn');

    logger.warn('test', 'test message');

    await logger.flush();

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test', 'test message');
  });

  it('should call logger.debug once with correct arguments', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
    });

    const spy = jest.spyOn(logger, 'debug');

    logger.debug('test', 'test message');

    await logger.flush();

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test', 'test message');
  });

  it('should call logger.trace once with correct arguments', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
    });

    const spy = jest.spyOn(logger, 'trace');

    logger.trace('test', 'test message');

    await logger.flush();

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test', 'test message');
  });

  it('should call logger.fatal once with correct arguments', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
    });

    const spy = jest.spyOn(logger, 'fatal');

    logger.fatal('test', 'test message');

    await logger.flush();

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test', 'test message');
  });

  it('should not send request when there are no logs to flush', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
    });

    await logger.flush();

    expect(http.request).not.toHaveBeenCalled();
  });

  it('should pass custom headers to Loki request', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
      headers: {
        Authorization: 'Bearer test-token',
        'X-Scope-OrgID': 'test-tenant',
      },
    });

    logger.info('test', 'test message');

    await logger.flush();

    expect(http.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'X-Scope-OrgID': 'test-tenant',
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should include optional params in log body and not in Loki labels', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'http://loki:3100',
      pattern: 'test',
    });

    logger.info('test', 'test message', { userId: '123' });

    await logger.flush();

    const requestBody = client.write.mock.calls[0][0] as string;
    const payload = JSON.parse(requestBody) as {
      streams: Array<{
        stream: Record<string, unknown>;
        values: Array<[string, string]>;
      }>;
    };

    expect(payload.streams[0].stream).not.toHaveProperty('0');

    const logBody = JSON.parse(payload.streams[0].values[0][1]) as {
      params?: unknown[];
    };

    expect(logBody.params).toEqual([{ userId: '123' }]);
  });

  it('should use HTTPS request for HTTPS Loki URL', async () => {
    const logger: Logger = loki({
      name: 'test',
      stage: 'local',
      url: 'https://loki.example.com',
      pattern: 'test',
    });

    logger.info('test', 'test message');

    await logger.flush();

    expect(https.request).toHaveBeenCalledTimes(1);
    expect(http.request).not.toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
