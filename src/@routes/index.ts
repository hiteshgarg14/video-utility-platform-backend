import { Application } from 'express';
import VideUploadRoutes from './VideoRoutes';

export default class Routes {
  public init = (app: Application): void => {
    app.use('/api/video', new VideUploadRoutes().router);
  };
}
