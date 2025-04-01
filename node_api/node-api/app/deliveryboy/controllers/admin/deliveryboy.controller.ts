/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import DeliveryBoy from '../../models/deliveryboy.model';
const { ObjectId } = require('mongodb');
import bcrypt from 'bcrypt';
import { CRYPT_SIZE } from '../../../utils/Constants';
import { dateFormate } from '../../../commons/constants';

export class DeliveryBoyController {
  constructor() {}
  async createDeliveryBoy(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const delivery = new DeliveryBoy({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      ...req.body,
    });
    try {
      delivery
        .save()
        .then(() => {
          res.status(200).send({ message: 'Delivery boy created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateDeliveryBoyById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    if (req.body.var_password && req.body.var_password.length > 2) {
      const salt = await bcrypt.genSalt(CRYPT_SIZE);
      const hash = await bcrypt.hash(req.body.var_password, salt);
      req.body.var_password = hash;
    }
    const delivery = {
      updated_date: cDate,
      ...req.body,
    };
    try {
      DeliveryBoy.findOneAndUpdate({ int_glcode: req.params.id }, delivery, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Delivery boy updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteDeliveryBoyById(req: Request, res: Response) {
    try {
      const ids = req.params.ids.split(',');
      for (let i = 0; i < ids.length; i++) {
        await DeliveryBoy.findOneAndDelete({ _id: ids[i] });
      }
      res.status(200).send({ message: 'Delivery boy deleted' });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllDeliveryBoy(req: Request, res: Response) {
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
      { var_name: { $regex: req.body.search, $options: 'i' } },
      { var_email: { $regex: req.body.search, $options: 'i' } },
      { var_mobile_no: { $regex: req.body.search, $options: 'i' } },
    ];
    try {
      DeliveryBoy.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: filter,
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((deliveries: any) => {
          DeliveryBoy.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: filter,
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: deliveries, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Delivery boy not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getDeliveryBoyById(req: Request, res: Response) {
    try {
      DeliveryBoy.findOne({ _id: req.params.id })
        .then((delivery: any) => {
          res.status(200).send({ data: { ...delivery._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Delivery boy not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
