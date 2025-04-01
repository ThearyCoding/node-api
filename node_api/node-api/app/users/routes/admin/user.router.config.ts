import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { UserController } from '../../controllers/admin/user.controller';
import { LoginController } from '../../controllers/admin/login.controller';
import { UsersMiddleWare } from '../../midleware/admin/user.midleware';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/mobile/admin.midlware';
import FileMiddleware from '../../../commons/fileupload.middleware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class WebUserRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'UserRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const usersConntroller = new UserController();
    const loginController = new LoginController();
    const usersMiddleWare = new UsersMiddleWare();
    const authMiddleWare = new AuthMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/user', [FileMiddleware.diskLoader.single('image'),disableAddDelete.validateAuthorization, usersMiddleWare.validateSignUpFields, usersConntroller.createUser]);
    this.app.put('/user', [FileMiddleware.diskLoader.single('image'),disableAddDelete.validateAuthorization, authMiddleWare.validateAuthorization, usersConntroller.updateUser]);
    this.app.put('/user/:id', FileMiddleware.diskLoader.single('image'),disableAddDelete.validateAuthorization, [adminMiddleWare.validateAdminUser, usersConntroller.updateUserById]);
    this.app.get('/user', [authMiddleWare.validateAuthorization, usersConntroller.getUser]);
    this.app.post('/users', [adminMiddleWare.validateAdminUser, usersConntroller.getAllUser]);
    this.app.get('/user/:id', [adminMiddleWare.validateAdminUser, usersConntroller.getUserById]);
    this.app.delete('/user', [usersMiddleWare.validateSignInFields,disableAddDelete.validateAuthorization, usersConntroller.deleteUser]);
    this.app.delete('/users/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, usersConntroller.deleteUserById]);
    this.app.post('/login', [usersMiddleWare.validateSignInFields, loginController.login]);
  }
}
