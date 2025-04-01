import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { DeliveryBoyController } from '../../controllers/admin/deliveryboy.controller';
import { DeliveryBoyMiddleWare } from '../../midleware/admin/deliveryboy.midleware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class DeliveryBoyRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'DeliveryBoyRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const deliveryBoyController = new DeliveryBoyController();
    const authMiddleWare = new AuthMiddleWare();
    const deliveryBoyMiddleWare = new DeliveryBoyMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/delivery-boys', [
      deliveryBoyMiddleWare.validateOfferBannerFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      deliveryBoyController.createDeliveryBoy,
    ]);
    this.app.put('/delivery-boys/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, deliveryBoyController.updateDeliveryBoyById]);
    this.app.post('/alldeliveryboys', [adminMiddleWare.validateAdminUser, deliveryBoyController.getAllDeliveryBoy]);
    this.app.get('/delivery-boys/:id', [authMiddleWare.validateAuthorization, deliveryBoyController.getDeliveryBoyById]);
    this.app.delete('/delivery-boys/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, deliveryBoyController.deleteDeliveryBoyById]);
  }
}
