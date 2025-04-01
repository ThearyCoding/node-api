import express from 'express';

export class OfferBannerMiddleWare {
  private static instance: OfferBannerMiddleWare;

  static getInstance() {
    if (!OfferBannerMiddleWare.instance) {
      OfferBannerMiddleWare.instance = new OfferBannerMiddleWare();
    }
    return OfferBannerMiddleWare.getInstance;
  }
  validateOfferBannerFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_title) {
      res.status(400).send({ message: 'Title is required field' });
    } else if (!req.body.var_image) {
      res.status(400).send({ message: 'Image is required field' });
    } else next();
  }
}
