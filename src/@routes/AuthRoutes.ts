import { Router } from 'express';
import AuthController from '../@controllers/AuthController';
import { checkJwt } from '../@middlewares/checkJwt';

export default class AuthRoutes {
  public router: Router;
  public authController: AuthController = new AuthController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.post('/login', this.authController.login);
    this.router.post(
      '/change-password',
      [checkJwt],
      this.authController.changePassword,
    );
  }
}
