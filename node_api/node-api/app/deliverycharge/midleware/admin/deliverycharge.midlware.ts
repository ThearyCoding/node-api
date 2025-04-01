import express from 'express';

export class DeliveryChargeMiddleWare {
  private static instance: DeliveryChargeMiddleWare;

  static getInstance() {
    if (!DeliveryChargeMiddleWare.instance) {
      DeliveryChargeMiddleWare.instance = new DeliveryChargeMiddleWare();
    }
    return DeliveryChargeMiddleWare.getInstance;
  }
  validateDeliveryChargeFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_charges) {
      res.status(400).send({ message: 'Delivery charge is required field' });
    } else next();
  }
}
