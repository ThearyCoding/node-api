import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../../commons/midleware/mobile/admin.midlware';
import { CategoryController } from '../../controllers/admin/category.controller';
import { CategoryMiddleWare } from '../../midlwares/cagory.midlware';
import FileMiddleware from '../../../../commons/fileupload.middleware';
import { DisableAddDeleteMiddleWare } from '../../../../commons/midleware/admin/disableadddelete.midleware';
import { SharedController } from '../../../../shared/controllers/shared.controller';

export class CategoryRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'CategoryRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const categoryController = new CategoryController();
    const authMiddleWare = new AuthMiddleWare();
    const categoryMiddleWare = new CategoryMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();

    this.app.post('/categories', [
      categoryMiddleWare.validateCategoryFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      categoryController.createCategory,
    ]);
    this.app.put('/categories/:id', [
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      categoryController.updateCategoryById,
    ]);
    this.app.post('/allcategories', [categoryController.getAllCategory]);
    this.app.get('/categories/:id', [authMiddleWare.validateAuthorization, categoryController.getCategoryById]);
    this.app.delete('/categories/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, categoryController.deleteCategoryById]);
  }
}
