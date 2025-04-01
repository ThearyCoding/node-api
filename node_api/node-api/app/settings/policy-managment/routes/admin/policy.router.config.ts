import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AdminMiddleWare } from '../../../../commons/midleware/admin/admin.midlware';
import { PolicyController } from '../../controllers/admin/policy.controller';
import { DisableAddDeleteMiddleWare } from '../../../../commons/midleware/admin/disableadddelete.midleware';

export class PolicyRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'PolicyRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const policyController = new PolicyController();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/policy', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, policyController.createPolicy]);
    this.app.put('/policy/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, policyController.updatePolicyById]);
    this.app.get('/policy', [policyController.getAllPolicy]);
    this.app.get('/policy/:id', [adminMiddleWare.validateAdminUser, policyController.getPolicyById]);
    this.app.delete('/policy/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, policyController.deletePolicyById]);
  }
}
