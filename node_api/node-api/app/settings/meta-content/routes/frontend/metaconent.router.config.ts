import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { MetaContentController } from '../../controllers/admin/metacontent.controller';

export class MetaContentFrontendRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'MetaContentFrontendRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const metaConent = new MetaContentController();

    this.app.get('/v1/meta-content', [metaConent.getAllMetaconent]);
  }
}
