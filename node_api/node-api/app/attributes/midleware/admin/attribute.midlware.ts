import express from 'express';

export class AttributeMiddleWare {
  private static instance: AttributeMiddleWare;

  static getInstance() {
    if (!AttributeMiddleWare.instance) {
      AttributeMiddleWare.instance = new AttributeMiddleWare();
    }
    return AttributeMiddleWare.getInstance;
  }
  validateAttributeFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Name is required field' });
    } else next();
  }
}
