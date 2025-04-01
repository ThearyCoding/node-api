/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Policy from '../../models/policy.model';
import { dateFormate } from '../../../../commons/constants';
const { ObjectId } = require('mongodb');

export class PolicyController {
  constructor() {}
 
  async getAllPolicy(req: Request, res: Response) {
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
      Policy.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((policy: any) => {
          Policy.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: policy, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Policy not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
 
}
