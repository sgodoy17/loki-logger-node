import { Logger, loki } from '../../src';

describe('AppHandler test suite', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({}),
    });
  });

  it('should call logger.info once with correct arguments', async () => {
    const logger: Logger = loki({
      name: 'test-service',
      stage: 'local',
      url: 'http://loki:3200',
      pattern: 'test',
    });

    const spy = jest.spyOn(logger, 'info');

    logger.info('test', 'test message');

    await logger.execute();

    expect(global.fetch).toHaveBeenCalledTimes(1);
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

    expect(global.fetch).toHaveBeenCalledTimes(1);
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

    expect(global.fetch).toHaveBeenCalledTimes(1);
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

    expect(global.fetch).toHaveBeenCalledTimes(1);
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

    expect(global.fetch).toHaveBeenCalledTimes(1);
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

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test', 'test message');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
