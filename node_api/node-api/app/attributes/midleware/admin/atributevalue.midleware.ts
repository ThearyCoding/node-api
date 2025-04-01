import express from 'express';

export class AttributeValueMiddleWare {
  private static instance: AttributeValueMiddleWare;

  static getInstance() {
    if (!AttributeValueMiddleWare.instance) {
      AttributeValueMiddleWare.instance = new AttributeValueMiddleWare();
    }
    return AttributeValueMiddleWare.getInstance;
  }
  validateAttributeValueFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Name is required field' });
    } else if (!req.body.attribute_id) {
      res.status(400).send({ message: 'Attribute Id is required field' });
    } else next();
  }
}
