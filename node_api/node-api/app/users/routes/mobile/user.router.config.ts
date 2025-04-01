import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { UserController } from '../../controllers/mobile/user.controller';
import { LoginController } from '../../controllers/mobile/login.controller';
import { UsersMiddleWare } from '../../midleware/mobile/user.midleware';
import { AuthMiddleWare } from '../../../commons/midleware/mobile/auth.midleware';

export class UserRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'UserRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const usersConntroller = new UserController();
    const loginController = new LoginController();
    const authMiddleWare = new AuthMiddleWare();
    const usersMiddleWare = new UsersMiddleWare();
    this.app.post('/user/userSignup', [usersMiddleWare.validateSignUpFields, usersConntroller.createUser]);
    this.app.post('/account/updateProfile', [authMiddleWare.validateAuthorization, usersConntroller.updateUser]);
    this.app.post('/account/deleteAccount', [authMiddleWare.validateAuthorization, usersConntroller.deleteUser]);
    this.app.post('/user/userSignin', [loginController.login]);
    this.app.post('/account', [authMiddleWare.validateAuthorization, usersConntroller.getUser]);
    this.app.post('/account/changePassword', [authMiddleWare.validateAuthorization, usersConntroller.changePassword]);
  }
}
