import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { BrandController } from '../../controller/brand.controller';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { BrandMiddleWare } from '../../midleware/brand.midlware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import FileMiddleware from '../../../commons/fileupload.middleware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class BrandRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'BrandRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const brandController = new BrandController();
    const authMiddleWare = new AuthMiddleWare();
    const brandMiddleWare = new BrandMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/brands', [
      brandMiddleWare.validateBrandFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      brandController.createBrand,
    ]);
    this.app.post('/allbrands', [authMiddleWare.validateAuthorization, brandController.getAllBrand]);
    this.app.put('/brands/:id', [authMiddleWare.validateAuthorization, brandController.updateBrandById]);
    this.app.get('/brands/:id', [authMiddleWare.validateAuthorization, brandController.getBrandById]);
    this.app.delete('/brands/:ids', [adminMiddleWare.validateAdminUser,    disableAddDelete.validateAuthorization, brandController.deleteBrandById]);
  }
}
