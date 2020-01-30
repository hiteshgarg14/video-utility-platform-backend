import { Router } from 'express';
import { checkJwt } from '../@middlewares/checkJwt';
import { checkRole } from '../@middlewares/checkRole';
import UserController from '../@controllers/UserController';

export default class UserRoutes {
  public router: Router;
  public userController: UserController = new UserController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router
      .get('/', [checkJwt, checkRole(['ADMIN'])], this.userController.listAll)
      .post('/', [checkJwt, checkRole(['ADMIN'])], this.userController.newUser)
      .get(
        '/:id([0-9]+)',
        [checkJwt, checkRole(['ADMIN'])],
        this.userController.getOneById,
      )
      .patch(
        '/:id([0-9]+)',
        [checkJwt, checkRole(['ADMIN'])],
        this.userController.editUser,
      )
      .delete(
        '/:id([0-9]+)',
        [checkJwt, checkRole(['ADMIN'])],
        this.userController.deleteUser,
      );
  }
}
