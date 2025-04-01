import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { DeliveryChargeController } from '../../controller/admin/deliverycharge.controller';
import { DeliveryChargeMiddleWare } from '../../midleware/admin/deliverycharge.midlware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class DeliveryChargeRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'DeliveryRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const deliveryChargeController = new DeliveryChargeController();
    const authMiddleWare = new AuthMiddleWare();
    const deliveryChargeMiddleWare = new DeliveryChargeMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/delivery-charges', [
      deliveryChargeMiddleWare.validateDeliveryChargeFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      deliveryChargeController.createDeliveryCharge,
    ]);
    this.app.put('/delivery-charges/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, deliveryChargeController.updateDeliveryChargeById]);
    this.app.post('/alldeliverycharges', [authMiddleWare.validateAuthorization, deliveryChargeController.getAllDeliveryCharge]);
    this.app.get('/delivery-charges/:id', [authMiddleWare.validateAuthorization, deliveryChargeController.getDeliveryChargeById]);
    this.app.delete('/delivery-charges/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, deliveryChargeController.deleteDeliveryChargeById]);
  }
}
