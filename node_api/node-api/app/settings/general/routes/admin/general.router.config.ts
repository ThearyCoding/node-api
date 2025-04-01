import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { GeneralController } from '../../controllers/admin/general.controller';
import { GeneralMiddleWare } from '../../midlewares/admin/general.midleware';
import { AdminMiddleWare } from '../../../../commons/midleware/admin/admin.midlware';
import { DisableAddDeleteMiddleWare } from '../../../../commons/midleware/admin/disableadddelete.midleware';

export class GeneralRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'GeneralRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const generalController = new GeneralController();
    const generalMiddleWare = new GeneralMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/general', [generalMiddleWare.validateGeneralFields,disableAddDelete.validateAuthorization, adminMiddleWare.validateAdminUser, generalController.createGeneral]);
    this.app.put('/general/:id', [adminMiddleWare.validateAdminUser, disableAddDelete.validateAuthorization,generalController.updateGeneralById]);
    this.app.get('/general', [generalController.getAllGeneral]);
    this.app.get('/general/:id', [adminMiddleWare.validateAdminUser, generalController.getGeneralById]);
    this.app.delete('/general/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, generalController.deleteGeneralById]);
  }
}
