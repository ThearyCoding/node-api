import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AdminMiddleWare } from '../../../../commons/midleware/admin/admin.midlware';
import { MetaContentController } from '../../controllers/admin/metacontent.controller';
import { DisableAddDeleteMiddleWare } from '../../../../commons/midleware/admin/disableadddelete.midleware';

export class MetaContentRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'MetaContentRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const metaConent = new MetaContentController();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/meta-content', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, metaConent.createMetacontent]);
    this.app.put('/meta-content/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, metaConent.updateMetacontentById]);
    this.app.get('/meta-content', [metaConent.getAllMetaconent]);
  }
}
