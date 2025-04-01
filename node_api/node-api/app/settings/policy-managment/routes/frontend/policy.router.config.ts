import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { PolicyController } from '../../controllers/frontend/policy.controller';

export class PolicyFontendRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'PolicyFontendRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const policyController = new PolicyController();
   
    this.app.get('/v1/policy', [policyController.getAllPolicy]);

  }
}
