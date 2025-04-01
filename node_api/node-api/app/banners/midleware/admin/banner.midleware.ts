import express from 'express';

export class BannerMiddleWare {
  private static instance: BannerMiddleWare;

  static getInstance() {
    if (!BannerMiddleWare.instance) {
      BannerMiddleWare.instance = new BannerMiddleWare();
    }
    return BannerMiddleWare.getInstance;
  }
  validateBannerFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Title is required field' });
    } else if (!req.body.var_image) {
      res.status(400).send({ message: 'Image is required field' });
    } else next();
  }
}
