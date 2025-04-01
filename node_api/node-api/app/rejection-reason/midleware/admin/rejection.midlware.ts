import express from 'express';

export class RejectionMiddleWare {
  private static instance: RejectionMiddleWare;

  static getInstance() {
    if (!RejectionMiddleWare.instance) {
      RejectionMiddleWare.instance = new RejectionMiddleWare();
    }
    return RejectionMiddleWare.getInstance;
  }
  validateReasonFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Title is required field' });
    } else next();
  }
}
