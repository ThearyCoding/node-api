import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { OrderController } from '../../controllers/admin/order.controller';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { OrderMiddleWare } from '../../midlwares/admin/order.midlware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class OrderRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'OrderRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const orderController = new OrderController();
    const authMiddleWare = new AuthMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const orderMiddleWare = new OrderMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/orders', [orderMiddleWare.validateOrderFields, authMiddleWare.validateAuthorization, orderController.createOrder]);
    this.app.post('/comments', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, orderController.addComment]);
    this.app.put('/orders/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, orderController.updateOrderById]);
    this.app.put('/returnorder/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, orderController.updateReturnOrder]);
    this.app.post('/allorders', [authMiddleWare.validateAuthorization, orderController.getAllOrders]);
    this.app.get('/orders/:id', [authMiddleWare.validateAuthorization, orderController.getOrderById]);
    this.app.get('/invoice/:id', [ orderController.getOrderById]);
    this.app.get('/invoice-pdf/:id', [ orderController.getInvoicePdf]);
    this.app.post('/dashboardorders', [adminMiddleWare.validateAdminUser, orderController.getDashboardOrders]);
  }
}
