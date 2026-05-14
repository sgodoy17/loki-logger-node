import * as http from 'node:http';

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

    await logger.execute();

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

    await logger.execute();

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

    await logger.execute();

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

    await logger.execute();

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

    await logger.execute();

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

    await logger.execute();

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test', 'test message');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
