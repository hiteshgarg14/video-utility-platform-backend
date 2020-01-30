import { Application } from 'express';
import AuthRoutes from './AuthRoutes';
import UserRoutes from './UserRoutes';

export default class Routes {
  public init = (app: Application): void => {
    app.use('/api/auth', new AuthRoutes().router);
    app.use('/api/user', new UserRoutes().router);
  };
}
