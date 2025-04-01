import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { PromoCodeController } from '../../controller/frontend/promocde.controller';


export class FrontendPromocodeRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'FrontendPromocodeRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const promoCodeController = new PromoCodeController();
    const authMiddleWare = new AuthMiddleWare();

    this.app.get('/v1/promocodes', [authMiddleWare.validateAuthorization, promoCodeController.getAllPromocode]);
    this.app.post('/v1/promocodes', [authMiddleWare.validateAuthorization, promoCodeController.validatePromo]);

  }
}
