/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Address from '../../models/address.model';
import { dateFormate } from '../../../commons/constants';
import { logger } from '../../../commons/logger.middleware';
const { ObjectId } = require('mongodb');

export class AddressController {
  constructor() {}
  async createAddress(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const address = new Address({
      _id: cId,
      int_glcode: cId.toString(),
      dt_createddate: cDate,
      fk_user: req.body.tuser.user_id,
      dt_modifydate: cDate,
      chr_publish: true,
      ...req.body,
    });
    try {
      address
        .save()
        .then(() => {
          res.status(200).send({ message: 'Address created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateAddressById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);

    try {
      Address.findOneAndUpdate(
        { int_glcode: req.params.id },
        {
          $set: {
            dt_modifydate: cDate,
            ...req.body,
          },
        },
        {
          new: false,
          overwrite: true,
        },
      )
        .then(() => {
          res.status(200).send({ message: 'Address updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteAddressById(req: Request, res: Response) {
    try {
      Address.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Address deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Address not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllAddressByUser(req: Request, res: Response) {
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
      Address.find({ fk_user: req.body.id ? req.body.id : req.body.tuser.user_id })
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((address: any) => {
          res.status(200).send({ data: address });
        })
        .catch(() => {
          res.status(404).send({ message: 'Address not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAddressById(req: Request, res: Response) {
    try {
      Address.findOne({ _id: req.params.id })
        .then((address: any) => {
          res.status(200).send({ data: { ...address._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Address not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
