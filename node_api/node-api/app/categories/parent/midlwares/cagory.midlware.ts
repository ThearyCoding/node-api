import express from 'express';

export class CategoryMiddleWare {
  private static instance: CategoryMiddleWare;

  static getInstance() {
    if (!CategoryMiddleWare.instance) {
      CategoryMiddleWare.instance = new CategoryMiddleWare();
    }
    return CategoryMiddleWare.getInstance;
  }
  validateCategoryFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(req.body)
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Name is required field' });
    } else if (!req.body.var_icon) {
      res.status(400).send({ message: 'Icon is required field' });
    } else next();
  }
}
