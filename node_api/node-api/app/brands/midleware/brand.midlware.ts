import express from 'express';

export class BrandMiddleWare {
  private static instance: BrandMiddleWare;

  static getInstance() {
    if (!BrandMiddleWare.instance) {
      BrandMiddleWare.instance = new BrandMiddleWare();
    }
    return BrandMiddleWare.getInstance;
  }
  validateBrandFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Name is required field' });
    } else next();
  }
}
