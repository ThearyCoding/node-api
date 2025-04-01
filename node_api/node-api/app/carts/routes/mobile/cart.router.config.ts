import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { CartController } from '../../controller/mobile/cart.controller';
import { CartMiddleWare } from '../../midleware/mobile/cart.midleware';

export class CartsMobileRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'CartMobileRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const cartController = new CartController();
    const authMiddleWare = new AuthMiddleWare();
    const cartMiddleWare = new CartMiddleWare();
    this.app.post('/cart/addUpdateCart', [authMiddleWare.validateAuthorization, cartMiddleWare.validateCartFields, cartController.createUpdateCart]);
    this.app.post('/cart', [authMiddleWare.validateAuthorization, cartController.getAllCarts]);
    this.app.post('/cart/cartCount', [authMiddleWare.validateAuthorization, cartController.countCarts]);
    this.app.post('/cart/deleteCartProduct', [authMiddleWare.validateAuthorization, cartController.deleteCarts]);
  }
}
