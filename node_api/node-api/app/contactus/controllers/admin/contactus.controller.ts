
import { Request, Response } from 'express';
import ContactUs from '../../models/contactus.model';
import { logger } from '../../../commons/logger.middleware';

export class ContactUsController {
    async getAllContactUs(req: Request, res: Response) {
        let limit = 10;
        let page = 0;
        let sort = {};
        if (req.body.limit && req.body.page) {
          limit = req.body.limit;
          page = (req.body.page - 1) * req.body.limit;
        }
        if (req.body.sort) {
          sort = req.body.sort;
        }
        try {
          ContactUs.find(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_email: { $regex: req.body.search, $options: 'i' } },
                        { var_name: { $regex: req.body.search, $options: 'i' } }
                        ],
                }
              : {},
          )
            .skip(page)
            .sort(sort)
            .limit(limit)
            .then((contacts: any) => {
                ContactUs.countDocuments(
                req.body.search && req.body.search.length > 0
                  ? {
                      $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                    }
                  : {},
              ).then((count: any) => {
                res.status(200).send({ data: contacts, total: count });
              });
            })
            .catch((e) => {
              logger.error('', e);
              res.status(404).send({ message: 'Contact us not found' });
            });
        } catch (e) {
          logger.error('', e);
          res.status(500).send({ message: 'Unexpected error' });
        }
      }
      async deleteContactUsById(req: Request, res: Response) {
        try {
          const ids = req.params.ids.split(',');
          for (let i = 0; i < ids.length; i++) {
            await ContactUs.findOneAndDelete({ _id: ids[i] });
          }
          res.status(200).send({ message: 'ContactUs deleted' });
        } catch (e) {
          logger.error('', e);
          res.status(500).send({ message: 'Unexpected error' });
        }
      }
}