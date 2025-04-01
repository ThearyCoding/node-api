/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import DeliveryCharge from '../../models/deliverycharge.model';
import { dateFormate } from '../../../commons/constants';
const { ObjectId } = require('mongodb');

export class DeliveryChargeController {
  constructor() {}
  async createDeliveryCharge(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const delivery = new DeliveryCharge({
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
          res.status(200).send({ message: 'Delivery charge created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateDeliveryChargeById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const delivery = {
      updated_date: cDate,
      ...req.body,
    };
    try {
      DeliveryCharge.findOneAndUpdate({ int_glcode: req.params.id }, delivery, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Delivery charge updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteDeliveryChargeById(req: Request, res: Response) {
    try {
      DeliveryCharge.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Delivery charge deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Delivery charge not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllDeliveryCharge(req: Request, res: Response) {
    try {
      DeliveryCharge.find()
        .then((deliveryCharge: any) => {
          res.status(200).send({ data: deliveryCharge });
        })
        .catch(() => {
          res.status(404).send({ message: 'Delivery charge not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getDeliveryChargeById(req: Request, res: Response) {
    try {
      DeliveryCharge.findOne({ _id: req.params.id })
        .then((deliverycharge: any) => {
          res.status(200).send({ data: { ...deliverycharge._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Delivery charge not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
