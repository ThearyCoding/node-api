import express from 'express';

export class CartMiddleWare {
  private static instance: CartMiddleWare;

  static getInstance() {
    if (!CartMiddleWare.instance) {
      CartMiddleWare.instance = new CartMiddleWare();
    }
    return CartMiddleWare.getInstance;
  }
  validateCartFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.fk_product) {
      res.status(400).send({ message: 'Product id is required field' });
    } else if (!req.body.var_unit) {
      res.status(400).send({ message: 'Unit is required field' });
    } else if (!req.body.fk_verient) {
      res.status(400).send({ message: 'Variant id is required field' });
    } else next();
  }
}
