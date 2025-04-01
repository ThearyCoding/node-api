import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { ProductController } from '../../controller/mobile/home.controller';
import { ProductListController } from '../../controller/mobile/productlist.controller';
import { ProductMiddleWare } from '../../midleware/mobile/product.midlewar';

export class ProductMobileRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'ProductMobileRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const productController = new ProductController();
    const authMiddleWare = new AuthMiddleWare();
    const productMiddleWare = new ProductMiddleWare();
    const productListController = new ProductListController();
    this.app.post('/home/getProductDetail', [authMiddleWare.validateOptionalAuthorization, productListController.getProductById]);
    this.app.post('/home', [authMiddleWare.validateOptionalAuthorization, productController.getHomeProduct]);
    this.app.post('/home/addRemoveWishlist', [authMiddleWare.validateAuthorization, productController.updateProductWishList]);
    this.app.post('/account/getWishlist', [authMiddleWare.validateAuthorization, productController.getWishList]);
    this.app.post('/account/addReview', [authMiddleWare.validateAuthorization, productListController.addProductReview]);
    this.app.post('/home/searchAll', [productListController.searchAll]);
    this.app.post('/home/changeVariants', [productListController.getProductVariant]);
    this.app.post('/home/getOfferProductList', [
      productMiddleWare.validateProductPage,
      authMiddleWare.validateOptionalAuthorization,
      productListController.getOfferProductList,
    ]);
    this.app.post('/home/getHotProductList', [
      productMiddleWare.validateProductPage,
      authMiddleWare.validateOptionalAuthorization,
      productListController.getHotProductList,
    ]);
    this.app.post('/home/attributeTree', [authMiddleWare.validateOptionalAuthorization, productListController.getAttributeTree]);
    this.app.post('/home/productList', [
      productMiddleWare.validateProductPage,
      authMiddleWare.validateOptionalAuthorization,
      productListController.productList,
    ]);
    this.app.post('/home/searchSuggations', [authMiddleWare.validateOptionalAuthorization, productListController.searchSuggetion]);
  }
}
