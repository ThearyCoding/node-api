import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AdminMiddleWare } from '../../../commons/midleware/mobile/admin.midlware';
import { RoleController } from '../../controllers/admin/role.controller';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class UserRoleRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'UserRoleRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const roleController = new RoleController();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/roles', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, roleController.createRole]);
    this.app.post('/allroles', [adminMiddleWare.validateAdminUser,roleController.getAllRoles]);
    this.app.get('/roles/:id', [adminMiddleWare.validateAdminUser, roleController.getRoleById]);
    this.app.delete('/roles/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, roleController.deleteRoleById]);
    this.app.put('/roles/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, roleController.updateRoleById]);
  }
}
