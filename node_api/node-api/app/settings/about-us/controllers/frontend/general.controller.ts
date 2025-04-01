import { Request, Response } from 'express';
import moment from 'moment';
import General from '../../models/about.model';
import About from '../../models/about.model';
import { dateFormate } from '../../../../commons/constants';
const { ObjectId } = require('mongodb');

export class AboutController {
    constructor() {}
    async getAllAbout(req: Request, res: Response) {
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
          About.find(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          )
            .skip(page)
            .sort(sort)
            .limit(limit)
            .then((about: any) => {
              General.countDocuments(
                req.body.search && req.body.search.length > 0
                  ? {
                      $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                    }
                  : {},
              ).then((count: any) => {
                res.status(200).send({ data: about, total: count });
              });
            })
            .catch(() => {
              res.status(404).send({ message: 'About not found' });
            });
        } catch (e) {
          res.status(500).send({ message: 'Unexpected error' });
        }
      }
    }