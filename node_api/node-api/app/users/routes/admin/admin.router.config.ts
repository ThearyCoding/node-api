import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { UsersMiddleWare } from '../../midleware/admin/user.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/mobile/admin.midlware';
import { AdminController } from '../../controllers/admin/admin.controller';
import { LoginController } from '../../controllers/admin/login.controller';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class AdminUserRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'AdminRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const adminController = new AdminController();
    const usersMiddleWare = new UsersMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const loginController = new LoginController();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/admins', [usersMiddleWare.validateSignUpFields, adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, adminController.createAdmin]);
    this.app.put('/admins', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, adminController.updateAdmin]);
    this.app.put('/admins/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, adminController.updateAdminById]);
    this.app.get('/admins', [adminMiddleWare.validateAdminUser, adminController.getAdmin]);
    this.app.post('/alladmins', [adminMiddleWare.validateAdminUser, adminController.getAllAdmins]);
    this.app.get('/admins/:id', [adminMiddleWare.validateAdminUser, adminController.getAdminById]);
    this.app.delete('/admins', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, adminController.deleteAdmin]);
    this.app.put('/changepassword', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, loginController.changePassword]);
    this.app.delete('/admins/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, adminController.deleteAdminById]);
  }
}
