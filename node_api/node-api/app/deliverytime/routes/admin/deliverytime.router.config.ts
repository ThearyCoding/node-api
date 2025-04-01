import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { DeliveryTimeMiddleWare } from '../../midleware/admin/deliverycharge.midlware';
import { DeliveryTimeController } from '../../controller/admin/deliverytime.controller';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class DeliveryTimeRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'DeliveryTimeRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const deliveryTimeController = new DeliveryTimeController();
    const authMiddleWare = new AuthMiddleWare();
    const deliveryTimeMiddleWare = new DeliveryTimeMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/delivery-times', [
      deliveryTimeMiddleWare.validateDeliveryTimeFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      deliveryTimeController.createDeliveryTime,
    ]);
    this.app.put('/delivery-times/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, deliveryTimeController.updateDeliveryTimeById]);
    this.app.post('/alldeliverytimes', [authMiddleWare.validateAuthorization, deliveryTimeController.getAllDeliveryTime]);
    this.app.get('/delivery-times/:id', [authMiddleWare.validateAuthorization, deliveryTimeController.getDeliveryChargeById]);
    this.app.delete('/delivery-times/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, deliveryTimeController.deleteDeliveryTimeById]);
  }
}
