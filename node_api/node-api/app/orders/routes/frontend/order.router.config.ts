import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { OrderController } from '../../controllers/frontend/order.controller';
import { OrderMiddleWare } from '../../midlwares/frontend/order.midleware';



export class OrderFrontendRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'OrderFrontendRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const orderController = new OrderController();
    const authMiddleWare = new AuthMiddleWare();
    const orderMiddleWare = new OrderMiddleWare();
    this.app.post('/v1/order', [orderMiddleWare.validateOrderFields,authMiddleWare.validateAuthorization, orderController.createOrder]);
    this.app.put('/v1/order/:id', [authMiddleWare.validateAuthorization, orderController.cancelOrder]);
    this.app.get('/v1/order', [authMiddleWare.validateAuthorization, orderController.getAllOrders]);
    this.app.get('/v1/order/:id', [authMiddleWare.validateAuthorization, orderController.getOrderById]);
    this.app.put('/v1/returnOrder', [authMiddleWare.validateAuthorization, orderController.returnOrder]);
    this.app.post('/v1/review', [authMiddleWare.validateAuthorization, orderController.addProductReview]);
    this.app.put('/v1/cancel-order/:id', [authMiddleWare.validateAuthorization, orderController.cancelOrder]);
  }
}
