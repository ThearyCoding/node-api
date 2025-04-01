/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import General from '../../models/general.model';
import { dateFormate } from '../../../../commons/constants';
const { ObjectId } = require('mongodb');

export class GeneralController {
  constructor() {}
  async createGeneral(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const general = new General({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      ...req.body,
    });
    try {
      general
        .save()
        .then(() => {
          res.status(200).send({ message: 'General created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateGeneralById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const general = new General({
      updated_date: cDate,
      ...req.body,
    });
    try {
      General.findOneAndUpdate({ int_glcode: req.params.id }, general, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'General updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteGeneralById(req: Request, res: Response) {
    try {
      General.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'General deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'General not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllGeneral(req: Request, res: Response) {
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
      General.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((general: any) => {
          General.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: general, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Banner not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getGeneralById(req: Request, res: Response) {
    try {
      General.findOne({ _id: req.params.id })
        .then((general: any) => {
          res.status(200).send({ data: { ...general._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'General not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
 
}
