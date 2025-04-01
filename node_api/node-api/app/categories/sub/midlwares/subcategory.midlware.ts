import express from 'express';

export class SubCategoryMiddleWare {
  private static instance: SubCategoryMiddleWare;

  static getInstance() {
    if (!SubCategoryMiddleWare.instance) {
      SubCategoryMiddleWare.instance = new SubCategoryMiddleWare();
    }
    return SubCategoryMiddleWare.getInstance;
  }
  validateCategoryFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Name is required field' });
    } else if (!req.body.fk_parent) {
      res.status(400).send({ message: 'Parent ID is required field' });
    } else next();
  }
}
