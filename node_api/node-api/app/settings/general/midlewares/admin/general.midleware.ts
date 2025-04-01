import express from 'express';

export class GeneralMiddleWare {
  private static instance: GeneralMiddleWare;

  static getInstance() {
    if (!GeneralMiddleWare.instance) {
      GeneralMiddleWare.instance = new GeneralMiddleWare();
    }
    return GeneralMiddleWare.getInstance;
  }
  validateGeneralFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.site_name) {
      res.status(400).send({ message: 'Site name is required field' });
    } else if (!req.body.footer_copyright) {
      res.status(400).send({ message: 'Footer copy is required field' });
    } else if (!req.body.site_logo) {
      res.status(400).send({ message: 'Site logo is required field' });
    } else if (!req.body.fav_icon) {
      res.status(400).send({ message: 'Fav icon is required field' });
    } else next();
  }
}
