import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { GeneralController } from '../../controllers/admin/general.controller';


export class GeneralFrontendRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'GeneralFrontendRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const generalController = new GeneralController();
    
    this.app.get('/v1/general', [generalController.getAllGeneral]);

  }
}
