/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Address from '../../models/address.model';
import { dateFormate } from '../../../commons/constants';
import Country from '../../models/country.model';
import State from '../../models/state.model';
import { logger } from '../../../commons/logger.middleware';
const { ObjectId } = require('mongodb');

export class AddressController {
  constructor() {}
  async createAddress(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    if (req.body.fk_address) {
      try {
        Address.findOneAndUpdate(
          { int_glcode: req.body.fk_address },
          {
            $set: {
              dt_modifydate: cDate,
              ...req.body,
              var_app_name: req.body.var_apartment?req.body.var_apartment:"",
              chr_type: req.body.var_type? req.body.var_type:"",
            },
          },
          {
            new: false,
            overwrite: true,
          },
        )
          .then(() => {
            res.status(200).send({ status: 1, message: 'Address updated' });
          })
          .catch((e) => {
            res.status(200).send({ status: 0, message: e });
          });
      } catch (e) {
        res.status(200).send({ status: 0, message: 'Unexpected error' });
      }
    } else {
      req.body.chr_type = req.body.var_type;
      req.body.var_app_name = req.body.var_apartment;
      try {
        delete req.body.var_type;
        delete req.body.var_apartment;
      } catch (e) {
        /* empty */
      }
      const address = new Address({
        _id: cId,
        int_glcode: cId.toString(),
        dt_createddate: cDate,
        fk_user: req.body.tuser.user_id,
        dt_modifydate: cDate,
        var_app_name: req.body.var_apartment,
        chr_publish: true,
        chr_type: req.body.var_type,
        ...req.body,
      });
      try {
        address
          .save()
          .then(() => {
            res.status(200).send({ status: 1, message: 'Address created' });
          })
          .catch((e) => {
            res.status(200).send({ status: 0, message: e });
          });
      } catch (e) {
        res.status(200).send({ status: 0, message: 'Unexpected error' });
      }
    }
  }
  async updateAddressById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);

    try {
      Address.findOneAndUpdate(
        { int_glcode: req.body.fk_address },
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
          res.status(200).send({ status: 1, message: 'Address updated' });
        })
        .catch((e) => {
          res.status(200).send({ status: 0, message: e });
        });
    } catch (e) {
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
  async deleteAddressById(req: Request, res: Response) {
    try {
      Address.findOneAndDelete({ _id: req.body.fk_address })
        .then(() => {
          res.status(200).send({ status: 1, message: 'Address deleted' });
        })
        .catch(() => {
          res.status(404).send({ status: 0, message: 'Address not found' });
        });
    } catch (e) {
      res.status(500).send({ status: 0, message: 'Unexpected error' });
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
          res.status(200).send({ status: 1, message: 'Success', data: address });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ status: 0, message: 'Address not found' });
        });
    } catch (e) {
      res.status(500).send({ status: 0, message: 'Unexpected error' });
    }
  }

  async getAllCountries(req: Request, res: Response) {
    try {
      Country.find()
        .then((countries: any) => {
          res.status(200).send({ status: 1, message: 'Success', data: countries });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(200).send({ status: 0, message: 'Country not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }

  async getAllState(req: Request, res: Response) {
    try {
      State.find({ country_code: req.body.contry_code })
        .then((countries: any) => {
          res.status(200).send({ status: 1, message: 'Sucess', data: countries });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(200).send({ status: 0, message: 'State not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
  async getAddressById(req: Request, res: Response) {
    try {
      Address.findOne({ _id: req.params.id })
        .then((address: any) => {
          res.status(200).send({ status: 1, message: 'Success', data: { ...address._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(200).send({ status: 0, message: 'Address not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
}
