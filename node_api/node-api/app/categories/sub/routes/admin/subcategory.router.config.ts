import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../../commons/midleware/mobile/admin.midlware';
import { SubCategoryMiddleWare } from '../../midlwares/subcategory.midlware';
import { SubCategoryController } from '../../controllers/admin/subcategory.controller';
import FileMiddleware from '../../../../commons/fileupload.middleware';
import { DisableAddDeleteMiddleWare } from '../../../../commons/midleware/admin/disableadddelete.midleware';

export class SubCategoryRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'CategoryRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const categoryController = new SubCategoryController();
    const authMiddleWare = new AuthMiddleWare();
    const categoryMiddleWare = new SubCategoryMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/sub-categories', [
      categoryMiddleWare.validateCategoryFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      categoryController.createCategory,
    ]);
    this.app.put('/sub-categories/:id', [
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      categoryController.updateCategoryById,
    ]);
    this.app.post('/allsubcategories', [categoryController.getAllCategory]);
    this.app.post('/allsubcatbyparent/:pid', [authMiddleWare.validateAuthorization, categoryController.getAllCategoryByParent]);
    this.app.get('/sub-categories/:id', [authMiddleWare.validateAuthorization, categoryController.getCategoryById]);
    this.app.delete('/sub-categories/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, categoryController.deleteCategoryById]);
  }
}
