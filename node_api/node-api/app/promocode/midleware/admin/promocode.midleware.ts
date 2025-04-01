import express from 'express';

export class PromocodeMiddleWare {
  private static instance: PromocodeMiddleWare;

  static getInstance() {
    if (!PromocodeMiddleWare.instance) {
      PromocodeMiddleWare.instance = new PromocodeMiddleWare();
    }
    return PromocodeMiddleWare.getInstance;
  }
  validatePromocodeFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_promocode) {
      res.status(400).send({ message: 'Promocode is required field' });
    } else if (!req.body.no_of_time) {
      res.status(400).send({ message: 'No of time is required field' });
    } else if (!req.body.expiry_date) {
      res.status(400).send({ message: 'Expiry date is required field' });
    } else if (!req.body.max_discount_price) {
      res.status(400).send({ message: 'Max discount Price is required field' });
    } else if (!req.body.var_percentage) {
      res.status(400).send({ message: 'Percentage is required field' });
    } else if (!req.body.min_order) {
      res.status(400).send({ message: 'Minimum order is required field' });
    } else next();
  }
}
