declare module 'node-media-server';
declare module 'mkdirp';
declare module 'express-async-errors';

declare namespace Express {
  interface Request {
    requestId?: string;
  }
}
