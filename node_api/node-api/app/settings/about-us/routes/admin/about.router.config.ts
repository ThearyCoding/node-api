import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AdminMiddleWare } from '../../../../commons/midleware/admin/admin.midlware';
import { AboutController } from '../../controllers/admin/general.controller';
import { DisableAddDeleteMiddleWare } from '../../../../commons/midleware/admin/disableadddelete.midleware';

export class AboutRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'AboutRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const aboutController = new AboutController();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/about', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, aboutController.createAbout]);
    this.app.put('/about/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, aboutController.updateAboutById]);
    this.app.get('/about', [aboutController.getAllAbout]);
    this.app.get('/about/:id', [adminMiddleWare.validateAdminUser, aboutController.getAboutById]);
    this.app.delete('/about/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, aboutController.deleteAboutById]);
  }
}
