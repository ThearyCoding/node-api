import express from 'express';

export class ProductMiddleWare {
  private static instance: ProductMiddleWare;

  static getInstance() {
    if (!ProductMiddleWare.instance) {
      ProductMiddleWare.instance = new ProductMiddleWare();
    }
    return ProductMiddleWare.getInstance;
  }
  validateProductFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Name is required field' });
    } else if (!req.body.fk_category) {
      res.status(400).send({ message: 'Category Id is required field' });
    } else if (!req.body.fk_subcategory) {
      res.status(400).send({ message: 'Sub category Id is required field' });
    } else if (!req.body.fk_brand) {
      res.status(400).send({ message: 'Brand id is required field' });
    } else if (!req.body.var_short_description) {
      res.status(400).send({ message: 'Short description is required field' });
    } else if (!req.body.txt_description) {
      res.status(400).send({ message: 'Description is required field' });
    } else next();
  }
}
