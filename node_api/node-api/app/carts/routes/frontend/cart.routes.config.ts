import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { CartMiddleWare } from '../../midleware/frontend/cart.midleware';
import { CartController } from '../../controller/frontend/cart.controller';


export class CartsFrontendRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'CartsFrontendRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const cartController = new CartController();
    const cartMiddleWare = new CartMiddleWare();
    const authMiddleWare = new AuthMiddleWare();
  
    this.app.put('/v1/carts', [authMiddleWare.validateAuthorization, cartMiddleWare.validateCartFields, cartController.createUpdateCart]);
    this.app.get('/v1/carts', [authMiddleWare.validateAuthorization, cartController.getAllCarts]);
    this.app.delete('/v1/carts/:fk_product/:fk_variant', [authMiddleWare.validateAuthorization, cartController.deleteCarts]);

  }
}
