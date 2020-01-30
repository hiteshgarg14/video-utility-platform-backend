import 'reflect-metadata';
import express, {
  Application,
  RequestHandler,
  ErrorRequestHandler,
} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import uuidv1 from 'uuid/v1';
import { requestLogger, responseLogger, errorLogger } from './@utils/logger';
import Routes from './@routes';

export default class AppFactory {
  public app: Application;

  constructor() {
    this.app = express();

    this.configureMiddlewares();
    this.app.use(this.logRequestResponse);
    this.registerRoutes();

    this.app.use(this.globalErrorHandler);
  }

  private configureMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(this.setRequestId);
  }

  private setRequestId: RequestHandler = (req, __, next) => {
    req.requestId = uuidv1();
    next();
  };

  private logRequestResponse: RequestHandler = (req, res, next) => {
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
      const responseTime = +new Date() - requestTime;
      const responseMessage = `${req.requestId} :: ${res.statusCode} :: ${responseTime}`;
      responseLogger.info(responseMessage);
    });

    next();
  };

  private globalErrorHandler: ErrorRequestHandler = (err, _, res, __) => {
    errorLogger.error(`${err.stack}`);
    res.status(500).json({
      message: 'Looks like something went wrong! Please try again later.',
    });
  };

  private registerRoutes() {
    new Routes().init(this.app);
  }
}
