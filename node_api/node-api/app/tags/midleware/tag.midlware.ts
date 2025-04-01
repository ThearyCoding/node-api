import express from 'express';

export class TagMiddleWare {
  private static instance: TagMiddleWare;

  static getInstance() {
    if (!TagMiddleWare.instance) {
      TagMiddleWare.instance = new TagMiddleWare();
    }
    return TagMiddleWare.getInstance;
  }
  validateTagFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Title is required field' });
    } else next();
  }
}
