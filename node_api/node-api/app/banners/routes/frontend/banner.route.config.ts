import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { BannerController } from '../../controllers/frontend/banner.controller';


export class FrontendBannerRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'FrontendBannerRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const bannerController = new BannerController();
    this.app.get('/v1/banners', [ bannerController.getHomeBanner]);
  }
}
