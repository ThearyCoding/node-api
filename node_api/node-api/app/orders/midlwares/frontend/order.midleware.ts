import express from 'express';

export class OrderMiddleWare {
  private static instance: OrderMiddleWare;

  static getInstance() {
    if (!OrderMiddleWare.instance) {
      OrderMiddleWare.instance = new OrderMiddleWare();
    }
    return OrderMiddleWare.getInstance;
  }
  validateOrderFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_payment_mode) {
      res.status(400).send({ message: 'Payment mode is required field' });
    } else if (!req.body.var_adress_id) {
      res.status(400).send({ message: 'User address is required field' });
    } else next();
  }
}