import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../../commons/midleware/admin/auth.midleware';
import { CategoryController } from '../../controllers/mobile/category.controller';

export class CategoryMobileRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'CategoryMobileRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const categoryController = new CategoryController();
    const authMiddleWare = new AuthMiddleWare();
    this.app.post('/home/getAllCaterogy', [authMiddleWare.validateOptionalAuthorization, categoryController.getAllCategory]);
    this.app.post('/home/categoryDetail', [authMiddleWare.validateOptionalAuthorization, categoryController.categoryDetail]);
  }
}
