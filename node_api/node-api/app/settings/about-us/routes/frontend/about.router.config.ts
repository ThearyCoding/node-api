import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AboutController } from '../../controllers/admin/general.controller';

export class AboutFrontendRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'AboutFrontendRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const aboutController = new AboutController();
  
    this.app.get('/v1/about', [aboutController.getAllAbout]);

  }
}
