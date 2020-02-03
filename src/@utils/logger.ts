import appRoot from 'app-root-path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const options = {
  error: {
    level: 'error',
    label: 'error',
    filename: `${appRoot}/logs/error-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: true,
    json: false,
    colorize: false,
  },
  request: {
    level: 'info',
    label: 'request',
    filename: `${appRoot}/logs/request-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: false,
    json: false,
    colorize: false,
  },
  response: {
    level: 'info',
    label: 'response',
    filename: `${appRoot}/logs/response-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: false,
    json: false,
    colorize: false,
  },
  app: {
    level: 'info',
    label: 'app',
    filename: `${appRoot}/logs/app-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: false,
    json: false,
    colorize: false,
  },
  console: {
    level: 'debug',
    label: 'console',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

export const logFormat = winston.format.printf(info => {
  return `${info.timestamp} :: ${
    info.label
  } :: ${info.level.toUpperCase()} :: ${info.message}`;
});

const getLogger = (
  name: 'error' | 'request' | 'response' | 'error' | 'app' | 'console',
): winston.Logger => {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.label({ label: options[name].label }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat,
    ),
    transports:
      name === 'console'
        ? [new winston.transports.Console(options[name])]
        : [new DailyRotateFile(options[name])],
    exitOnError: false, // do not exit on handled exceptions
  });
};

export const requestLogger: winston.Logger = getLogger('request');
export const responseLogger: winston.Logger = getLogger('response');
export const errorLogger: winston.Logger = getLogger('error');
// export const appLogger: winston.Logger = getLogger('app');
export const consoleLogger: winston.Logger = getLogger('console');
