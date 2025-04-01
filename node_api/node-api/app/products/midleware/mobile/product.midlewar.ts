import express from 'express';

export class ProductMiddleWare {
  private static instance: ProductMiddleWare;

  static getInstance() {
    if (!ProductMiddleWare.instance) {
      ProductMiddleWare.instance = new ProductMiddleWare();
    }
    return ProductMiddleWare.getInstance;
  }
  validateProductPage(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.page) {
      res.status(400).send({ message: 'Page is required field' });
    } else next();
  }
}
