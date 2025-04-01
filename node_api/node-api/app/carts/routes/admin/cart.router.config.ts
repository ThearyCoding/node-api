import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { CartController } from '../../controller/admin/cart.controller';
import { CartMiddleWare } from '../../midleware/admin/cart.midlware';

export class CartsRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'CartRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const cartController = new CartController();
    const authMiddleWare = new AuthMiddleWare();
    const cartMiddleWare = new CartMiddleWare();
    this.app.post('/carts', [authMiddleWare.validateAuthorization, cartMiddleWare.validateCartFields, cartController.createUpdateCart]);
    this.app.get('/carts', [authMiddleWare.validateAuthorization, cartController.getAllCarts]);
    this.app.delete('/carts/:id', [authMiddleWare.validateAuthorization, cartController.deleteCartById]);
  }
}
