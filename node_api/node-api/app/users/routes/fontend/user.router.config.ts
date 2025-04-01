

import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { LoginController } from '../../controllers/frontend/login.controller';
import { UsersMiddleWare } from '../../midleware/frontend/user.midleware';
import { AuthMiddleWare } from '../../../commons/midleware/frontend/auth.midleware';
import { UserController } from '../../controllers/frontend/user.controller';


export class FrontendUserRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'FrontendUserRoutes');
    this.configureRoutes();
  }
  configureRoutes() {

    const loginController = new LoginController();
    const usersMiddleWare = new UsersMiddleWare();
    const userController = new UserController();
    const authMiddleWare = new AuthMiddleWare();
    this.app.post('/v1/login', [usersMiddleWare.validateSignInFields, loginController.login]);
    this.app.post('/v1/changePassword', [authMiddleWare.validateAuthorization,  loginController.changePassword]);
    this.app.post('/v1/user', [  userController.createUser]);
    this.app.put('/v1/user', [ authMiddleWare.validateAuthorization, userController.updateUser]);
    this.app.get('/v1/user', [authMiddleWare.validateAuthorization, userController.getUser]);
  }
}
