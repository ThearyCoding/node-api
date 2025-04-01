/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Policy from '../../models/policy.model';
import { dateFormate } from '../../../../commons/constants';
const { ObjectId } = require('mongodb');

export class PolicyController {
  constructor() {}
  async createPolicy(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const policy = new Policy({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      ...req.body,
    });
    try {
      policy
        .save()
        .then(() => {
          res.status(200).send({ message: 'Policy created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updatePolicyById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const policy = new Policy({
      updated_date: cDate,
      ...req.body,
    });
    try {
      Policy.findOneAndUpdate({ int_glcode: req.params.id }, policy, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Policy updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deletePolicyById(req: Request, res: Response) {
    try {
      Policy.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Policy deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Policy not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
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
  async getPolicyById(req: Request, res: Response) {
    try {
      Policy.findOne({ _id: req.params.id })
        .then((policy: any) => {
          res.status(200).send({ data: { ...policy._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Policy not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
