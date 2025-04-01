import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { BannerController } from '../../controllers/admin/banner.controller';
import { BannerMiddleWare } from '../../midleware/admin/banner.midleware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class BannerRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'BannerRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const bannerController = new BannerController();
    const authMiddleWare = new AuthMiddleWare();
    const bannerMiddleWare = new BannerMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/banners', [bannerMiddleWare.validateBannerFields,disableAddDelete.validateAuthorization, adminMiddleWare.validateAdminUser, bannerController.createBaner]);
    this.app.put('/banners/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, bannerController.updateBannerById]);
    this.app.post('/allbanners', [authMiddleWare.validateAuthorization, bannerController.getAllBanner]);
    this.app.get('/banners/:id', [authMiddleWare.validateAuthorization, bannerController.getBannerById]);
    this.app.delete('/banners/:id', [adminMiddleWare.validateAdminUser, disableAddDelete.validateAuthorization,bannerController.deleteBannerById]);
  }
}
