/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import RejectionReason from '../../models/rejection.model';
const { ObjectId } = require('mongodb');

export class RejectionReasonController {
  constructor() {}
  async createRejection(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format('MM ddd, YYYY HH:mm:ss');
    const rejection = new RejectionReason({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      ...req.body,
    });
    try {
      rejection
        .save()
        .then(() => {
          res.status(200).send({ message: 'Rejection reason created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateRejectionById(req: Request, res: Response) {
    const cDate = moment().format('MM ddd, YYYY HH:mm:ss');
    const rejection = new RejectionReason({
      updated_date: cDate,
      ...req.body,
    });
    try {
      RejectionReason.findOneAndUpdate({ int_glcode: req.params.id }, rejection, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Rejection reason updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteRejectionById(req: Request, res: Response) {
    try {
      RejectionReason.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Rejection reason deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Rejection reason not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllRejection(req: Request, res: Response) {
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
      RejectionReason.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((reasons: any) => {
          RejectionReason.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: reasons, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Rejection reason not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAttributeById(req: Request, res: Response) {
    try {
      RejectionReason.findOne({ _id: req.params.id })
        .then((reason: any) => {
          res.status(200).send({ data: { ...reason._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Rejection reason not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
