/* eslint-disable indent */
import { Request, Response } from 'express';
import Promocode from '../../models/promocode.model';
import { logger } from '../../../commons/logger.middleware';


export class PromoCodeController {
  constructor() {}
  async getAllPromocode(req: Request, res: Response) {
    let limit = 10;
    let page = 0;

    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
    }
  
    try {
      Promocode.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_promocode: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)

        .limit(limit)
        .then((promocode: any) => {
          Promocode.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_promocode: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ status:1,data: promocode, total: count });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(200).send({status:0, message: 'Promocode not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({status:0, message: 'Unexpected error' });
    }
  }
}