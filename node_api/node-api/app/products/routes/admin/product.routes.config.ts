import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { ProductController } from '../../controller/admin/product.controller';
import { ProductMiddleWare } from '../../midleware/admin/product.midlware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class ProductValuesRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'ProductRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const productController = new ProductController();
    const authMiddleWare = new AuthMiddleWare();
    const productMiddleWare = new ProductMiddleWare();
    
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/products', [productMiddleWare.validateProductFields,disableAddDelete.validateAuthorization, adminMiddleWare.validateAdminUser, productController.createProduct]);
    this.app.post('/bulkupload', [disableAddDelete.validateAuthorization,disableAddDelete.validateAuthorization, adminMiddleWare.validateAdminUser, productController.createProductByBulk]);
    this.app.post('/bulkUpdate', [disableAddDelete.validateAuthorization,disableAddDelete.validateAuthorization, adminMiddleWare.validateAdminUser, productController.updateProductByBulk]);
    this.app.put('/products/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, productController.updateProductById]);
    this.app.post('/allproducts', [productController.getAllProduct]);
    this.app.put('/allStockhistory/:id', [adminMiddleWare.validateAdminUser,productController.getStockUpdateHistory]);
    this.app.get('/products/:id', [authMiddleWare.validateAuthorization, productController.getProductById]);
    this.app.delete('/products/:ids', [adminMiddleWare.validateAdminUser, disableAddDelete.validateAuthorization,productController.deleteProductById]);
    this.app.post('/validate-product', [adminMiddleWare.validateAdminUser, productController.validateBulkData]);
    this.app.post('/validate-update-product', [adminMiddleWare.validateAdminUser, productController.validateBulkUpdateData]);
    this.app.post('/variant-product', [authMiddleWare.validateAuthorization, productController.getProductByVariant]);
    this.app.put('/stock/:id', [authMiddleWare.validateAuthorization,disableAddDelete.validateAuthorization, productController.updateStock]);
  }
}
