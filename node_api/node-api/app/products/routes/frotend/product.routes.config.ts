import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { ProductController } from '../../controller/frontend/product.controller';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';


export class ProductsFrontendRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'ProductsFrontendRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const productController = new ProductController();
    const authMiddleWare = new AuthMiddleWare();
    this.app.post('/v1/products', [ authMiddleWare.validateOptionalAuthorization, productController.getAllProduct]);
    this.app.get('/v1/currency', [  productController.getCurrency]);
    this.app.post('/v1/search', [ authMiddleWare.validateOptionalAuthorization, productController.searchAll]);
    this.app.get('/v1/products/:slug', [ authMiddleWare.validateOptionalAuthorization, productController.getProductById]);
    this.app.post('/v1/variants', [ authMiddleWare.validateOptionalAuthorization, productController.getProductVariant]);
    this.app.put('/v1/wishlist', [ authMiddleWare.validateOptionalAuthorization, productController.updateProductWishList]);
    this.app.get('/v1/wishlist', [ authMiddleWare.validateOptionalAuthorization, productController.getWishList]);
    this.app.get('/v1/suggestion/:var_keywords', [ authMiddleWare.validateOptionalAuthorization, productController.searchSuggetion]);
    this.app.get('/v1/attribute-tree/:category', [ authMiddleWare.validateOptionalAuthorization, productController.getAttributeTree]);
  
  }
}
