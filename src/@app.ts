import 'reflect-metadata';
import 'express-async-errors';
import express, {
  Application,
  RequestHandler,
  ErrorRequestHandler,
} from 'express';
import bodyParser from 'body-parser';
import busboy from 'connect-busboy';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import uuidv1 from 'uuid/v1';
import { UI } from 'bull-board';
import * as Sentry from '@sentry/node';
import {
  requestLogger,
  responseLogger,
  errorLogger,
  consoleLogger,
} from './@utils/logger';
import Routes from './@routes';
import Configs from './@configs';

export default class AppFactory {
  public app: Application;

  constructor() {
    this.app = express();

    // Sentry must be the first configuration of the app
    this.configureSentry();

    this.configureGeneralMiddlewares();
    this.app.use(this.logRequestResponse);
    this.configureJobs();
    this.registerRoutes();

    this.configureErrorMiddelwares();
  }

  private configureSentry() {
    if (process.env.NODE_ENV !== 'test') {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
      });
      this.app.use(Sentry.Handlers.requestHandler() as RequestHandler);
    }
  }

  private configureGeneralMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(this.setRequestId);
    this.app.use(
      busboy({
        highWaterMark: Configs.busboyConfig.highWaterMark,
        limits: {
          fileSize: Configs.busboyConfig.fileSize,
        },
      }),
    );
  }

  private setRequestId: RequestHandler = (req, __, next) => {
    req.requestId = uuidv1();
    Sentry.configureScope(scope => {
      scope.setExtra('request_id', req.requestId);
    });
    next();
  };

  private logRequestResponse: RequestHandler = (req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
      const requestTime = +new Date();

      const requestMessage = `${
        req.requestId
      } :: ${req.method.toUpperCase()} :: ${req.url} :: ${JSON.stringify(
        req.body,
      )} :: ${req.headers.authorization || ''} :: ${req.headers[
        'x-forwarded-for'
      ] || req.connection.remoteAddress} :: ${req.get('User-Agent')}`;
      requestLogger.info(requestMessage);

      res.on('finish', () => {
        if (process.env.NODE_ENV !== 'test') {
          const responseTime = +new Date() - requestTime;
          const responseMessage = `${
            req.requestId
          } :: ${req.method.toUpperCase()} :: ${req.url} :: ${
            res.statusCode
          } :: ${responseTime}`;
          responseLogger.info(responseMessage);
          if (process.env.NODE_ENV !== 'production') {
            consoleLogger.info(
              `${req.method.toUpperCase()} :: ${req.url} :: ${
                res.statusCode
              } :: ${responseTime}`,
            );
          }
        }
      });
    }
    next();
  };

  private configureErrorMiddelwares() {
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(
        Sentry.Handlers.errorHandler({
          shouldHandleError(error) {
            if (error) {
              return true;
            }
            return false;
          },
        }) as ErrorRequestHandler,
      );
      this.app.use(this.globalErrorHandler);
    }
  }

  private globalErrorHandler: ErrorRequestHandler = (err, req, res, __) => {
    console.log(err);
    errorLogger.error(`${req.requestId} :: ${err.stack}`);
    res.status(500).json({
      message: 'Looks like something went wrong! Please try again later.',
    });
  };

  private configureJobs() {
    if (process.env.NODE_ENV !== 'test') {
      this.app.use('/admin/jobs', UI);
      require('./@jobs');
    }
  }
  private registerRoutes() {
    new Routes().init(this.app);
  }
}
