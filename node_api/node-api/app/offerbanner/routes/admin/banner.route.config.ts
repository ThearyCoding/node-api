import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { OfferBannerController } from '../../controllers/admin/offerbanner.controller';
import { OfferBannerMiddleWare } from '../../midleware/admin/offerbanner.midleware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class OfferBannerRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'OfferBannerRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const bannerController = new OfferBannerController();
    const authMiddleWare = new AuthMiddleWare();
    const bannerMiddleWare = new OfferBannerMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/offer-banners', [
      bannerMiddleWare.validateOfferBannerFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      bannerController.createOfferBaner,
    ]);
    this.app.put('/offer-banners/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, bannerController.updateOfferBannerById]);
    this.app.post('/all-offer-banners', [authMiddleWare.validateAuthorization, bannerController.getAllOfferBanner]);
    this.app.get('/offer-banners/:id', [authMiddleWare.validateAuthorization, bannerController.getOfferBannerById]);
    this.app.delete('/offer-banners/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, bannerController.deleteOfferBannerById]);
  }
}
