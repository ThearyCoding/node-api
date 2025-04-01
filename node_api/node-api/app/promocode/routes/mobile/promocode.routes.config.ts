import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { PromoCodeController } from '../../controller/mobile/promocode.controller';


export class MobilePromocodeRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'MobilePromocodeRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const promoCodeController = new PromoCodeController();
    const authMiddleWare = new AuthMiddleWare();

    this.app.post('/promocodes/allpromocodes', [authMiddleWare.validateAuthorization, promoCodeController.getAllPromocode]);

  }
}
