import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { OrderController } from '../../controllers/mobile/order.controller';
import { OrderMiddleWare } from '../../midlwares/mobile/order.midlware';

export class OrderMobileRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'OrderMobileRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const orderController = new OrderController();
    const authMiddleWare = new AuthMiddleWare();
    const orderMiddleWare = new OrderMiddleWare();
    this.app.post('/cart/placeOrder', [orderMiddleWare.validateOrderFields, authMiddleWare.validateAuthorization, orderController.createOrder]);
    this.app.post('/account/cancelOrder', [authMiddleWare.validateAuthorization, orderController.cancelOrder]);
    this.app.post('/account/getOrderList', [authMiddleWare.validateAuthorization, orderController.getAllOrders]);
    this.app.post('/account/getOrderDetail', [authMiddleWare.validateAuthorization, orderController.getOrderById]);
    this.app.post('/account/orderReturn', [authMiddleWare.validateAuthorization, orderController.returnOrder]);
  }
}
