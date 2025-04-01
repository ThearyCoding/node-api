import express from 'express';

export class DeliveryBoyMiddleWare {
  private static instance: DeliveryBoyMiddleWare;

  static getInstance() {
    if (!DeliveryBoyMiddleWare.instance) {
      DeliveryBoyMiddleWare.instance = new DeliveryBoyMiddleWare();
    }
    return DeliveryBoyMiddleWare.getInstance;
  }
  validateOfferBannerFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_name) {
      res.status(400).send({ message: 'Name is required field' });
    } else if (!req.body.var_email) {
      res.status(400).send({ message: 'Email is required field' });
    } else if (!req.body.var_mobile_no) {
      res.status(400).send({ message: 'Mobile is required field' });
    } else if (!req.body.var_password) {
      res.status(400).send({ message: 'Password is required field' });
    } else next();
  }
}
