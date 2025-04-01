/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import DeliveryTime from '../../models/deliverytime.model';
const { ObjectId } = require('mongodb');

export class DeliveryTimeController {
  constructor() {}
  async createDeliveryTime(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format('MM ddd, YYYY HH:mm:ss');
    const delivery = new DeliveryTime({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      ...req.body,
    });
    try {
      delivery
        .save()
        .then(() => {
          res.status(200).send({ message: 'Delivery time created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateDeliveryTimeById(req: Request, res: Response) {
    const cDate = moment().format('MM ddd, YYYY HH:mm:ss');
    const delivery = new DeliveryTime({
      updated_date: cDate,
      ...req.body,
    });
    try {
      DeliveryTime.findOneAndUpdate({ int_glcode: req.params.id }, delivery, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Delivery time updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteDeliveryTimeById(req: Request, res: Response) {
    try {
      DeliveryTime.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Delivery time deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Delivery time not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllDeliveryTime(req: Request, res: Response) {
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
    const filter = [
      { dt_start_time: { $regex: req.body.search, $options: 'i' } },
      { dt_end_time: { $regex: req.body.search, $options: 'i' } },
      { dt_slot_end_time: { $regex: req.body.search, $options: 'i' } },
      { chr_type: { $regex: req.body.search, $options: 'i' } },
    ];
    try {
      DeliveryTime.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: filter,
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((dtimes: any) => {
          DeliveryTime.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: filter,
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: dtimes, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Delivery time not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getDeliveryChargeById(req: Request, res: Response) {
    try {
      DeliveryTime.findOne({ _id: req.params.id })
        .then((dtimes: any) => {
          res.status(200).send({ data: { ...dtimes._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Delivery times not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
