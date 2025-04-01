import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { RejectionReasonController } from '../../controller/admin/rejection.controller';
import { RejectionMiddleWare } from '../../midleware/admin/rejection.midlware';

export class RejectionReasonRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'RejectionReasonRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const reasonController = new RejectionReasonController();
    const authMiddleWare = new AuthMiddleWare();
    const rejectionMiddleWare = new RejectionMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    this.app.post('/rejection-reasons', [
      rejectionMiddleWare.validateReasonFields,
      adminMiddleWare.validateAdminUser,
      reasonController.createRejection,
    ]);
    this.app.put('/rejection-reasons/:id', [adminMiddleWare.validateAdminUser, reasonController.updateRejectionById]);
    this.app.get('/rejection-reasons', [authMiddleWare.validateAuthorization, reasonController.getAllRejection]);
    this.app.get('/rejection-reasons/:id', [authMiddleWare.validateAuthorization, reasonController.getAllRejection]);
    this.app.delete('/rejection-reasons/:id', [adminMiddleWare.validateAdminUser, reasonController.deleteRejectionById]);
  }
}
