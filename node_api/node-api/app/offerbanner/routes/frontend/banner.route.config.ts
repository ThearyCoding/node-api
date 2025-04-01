import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { OfferBannerController } from '../../controllers/admin/offerbanner.controller';

export class OfferBannerFrontendRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'OfferBannerFrontendRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const bannerController = new OfferBannerController();
    const authMiddleWare = new AuthMiddleWare();
   
    this.app.post('/v1/offerbanners', [authMiddleWare.validateOptionalAuthorization, bannerController.getAllOfferBanner]);

  }
}
