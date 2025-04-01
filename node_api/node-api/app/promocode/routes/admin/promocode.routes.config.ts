import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { PromoCodeController } from '../../controller/admin/promocode.controller';
import { PromocodeMiddleWare } from '../../midleware/admin/promocode.midleware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class PromocodeRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'PromocodeRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const promoCodeController = new PromoCodeController();
    const authMiddleWare = new AuthMiddleWare();
    const promocodeMiddleWare = new PromocodeMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/promocodes', [
      promocodeMiddleWare.validatePromocodeFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      promoCodeController.createPromocode,
    ]);
    this.app.post('/cart/verifyPromocode', [authMiddleWare.validateAuthorization, promoCodeController.validatePromo]);
    this.app.put('/promocodes/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, promoCodeController.updatePromocodeById]);
    this.app.post('/allpromocodes', [authMiddleWare.validateAuthorization, promoCodeController.getAllPromocode]);
    this.app.get('/promocodes/:id', [authMiddleWare.validateAuthorization, promoCodeController.getPromocodeById]);
    this.app.delete('/promocodes/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, promoCodeController.deletePromocodeById]);
  }
}
