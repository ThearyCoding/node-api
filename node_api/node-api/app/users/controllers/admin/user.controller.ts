/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import User from '../../models/user.model';
const { ObjectId } = require('mongodb');
import bcrypt from 'bcrypt';
import { CRYPT_SIZE } from '../../../utils/Constants';
import Address from '../../../address/models/address.model';
import { dateFormate } from '../../../commons/constants';
import { logger } from '../../../commons/logger.middleware';
import { NodeLocalCache } from '../../../commons/node.cache';

export class UserController {
  constructor() {}
  async createUser(req: Request, res: Response) {
    const myId = new ObjectId();
    const cDate = moment().format(dateFormate);
    req.body.role_id = '';
    if (req.body.user_type) {
      req.body.user_type = undefined;
    }
    const user = new User({
      _id: myId,
      user_id: myId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      chr_verify: false,
      var_image: req.file ? req.file.filename : '',
      user_type: 'user',
      ...req.body,
    });
    try {
      user
        .save()
        .then((user: any) => {
          user.var_password = undefined;
          if (req.body.address) {
            const adress = JSON.parse(req.body.address);
            if (adress.length > 0) {
              adress.forEach(async (adr: any) => {
                if (adr.default_status && adr.default_status === 'Y') {
                  await Address.updateMany({ fk_user: user._id.toString() }, { $set: { default_status: 'N' } }, { multi: true });
                }
                const cId = new ObjectId();
                const cDate = moment().format(dateFormate);
                const address = new Address({
                  _id: cId,
                  int_glcode: cId.toString(),
                  dt_createddate: cDate,
                  fk_user: user._id.toString(),
                  dt_modifydate: cDate,
                  chr_publish: true,
                  ...adr,
                });

                address.save();
              });
            }
          }
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'User created', data: { ...user._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          if (e.code === 11000 && e.keyPattern.var_email === 1) {
            res.status(400).send({ message: 'Email already exist' });
          } else if (e.code === 11000 && e.keyPattern.var_mobile_no === 1) {
            res.status(400).send({ message: 'Mobile number already exist' });
          } else {
            res.status(500).send({ message: e });
          }
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }

  async updateUser(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    if (req.body.var_password && req.body.var_password.length > 2) {
      const salt = await bcrypt.genSalt(CRYPT_SIZE);
      const hash = await bcrypt.hash(req.body.var_password, salt);
      req.body.var_password = hash;
    }
    if (req.body.user_type) {
      req.body.user_type = 'user';
    }
    req.body.role_id = '';
    const user = {
      updated_date: cDate,
      ...req.body,
    };
    try {
      User.findOneAndUpdate({ user_id: req.body.tuser.user_id }, user, {
        new: true,
        upsert: true,
      })
        .then(() => {
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'User updated' });
        })
        .catch((e) => {
          logger.error('', e);
          if (e.code === 11000 && e.keyPattern.var_email === 1) {
            res.status(400).send({ message: 'Email already exist' });
          } else if (e.code === 11000 && e.keyPattern.var_mobile_no === 1) {
            res.status(400).send({ message: 'Mobile number already exist' });
          } else {
            res.status(500).send({ message: 'Unexpected error' });
          }
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }

  async updateUserById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    if (req.body.var_password && req.body.var_password.length > 2) {
      const salt = await bcrypt.genSalt(CRYPT_SIZE);
      const hash = await bcrypt.hash(req.body.var_password, salt);
      req.body.var_password = hash;
    }
    req.body.role_id = '';
    let user;
    if (req.file) {
      user = {
        updated_date: cDate,
        ...req.body,
        var_image: req.file!.filename,
        user_type: 'user',
      };
    } else {
      user = {
        updated_date: cDate,
        ...req.body,
        user_type: 'user',
      };
    }
    try {
      User.findOneAndUpdate(
        { user_id: req.params.id },
        { $set: user },
        {
          new: false,
          overwrite: true,
        },
      )
        .then(async () => {
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          if (req.body.address) {
            const adress = JSON.parse(req.body.address);
            if (adress.length > 0) {
              for (let i = 0; i < adress.length; i++) {
                const cId = new ObjectId();
                const cDate = moment().format(dateFormate);
                if (adress[i].default_status && adress[i].default_status === 'Y') {
                  await Address.updateMany({ fk_user: req.params.id }, { $set: { default_status: 'N' } }, { multi: true });
                }
                try {
                  if (adress[i].int_glcode !== '') {
                    const addressu = new Address({
                      dt_modifydate: cDate,
                      int_glcode: adress[i].int_glcode,
                      var_house_no: adress[i].var_house_no,
                      var_app_name: adress[i].var_app_name,
                      var_landmark: adress[i].var_landmark,
                      var_country: adress[i].var_country,
                      var_state: adress[i].var_state,
                      var_city: adress[i].var_city,
                      var_pincode: adress[i].var_pincode,
                      chr_type: adress[i].chr_type,
                      default_status: adress[i].default_status,
                      var_ipaddress: '',
                    });

                    await Address.findOneAndUpdate(
                      { int_glcode: adress[i].int_glcode },
                      { $set: addressu },
                      {
                        new: true,
                        upsert: true,
                      },
                    );
                  } else {
                    const address = new Address({
                      _id: cId,
                      int_glcode: cId.toString(),
                      dt_createddate: cDate,
                      fk_user: req.params.id,
                      dt_modifydate: cDate,
                      chr_publish: true,
                      ...adress[i],
                    });

                    address.save();
                  }
                } catch (e) {
                  /* empty */
                }
              }
            }
          }
          res.status(200).send({ message: 'User updated' });
        })
        .catch((e) => {
          logger.error('', e);
          if (e.code === 11000 && e.keyPattern.var_email === 1) {
            res.status(400).send({ message: 'Email already exist' });
          } else if (e.code === 11000 && e.keyPattern.var_mobile_no === 1) {
            res.status(400).send({ message: 'Mobile number already exist' });
          } else {
            res.status(500).send({ message: 'Unexpected error' });
          }
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteUser(req: Request, res: Response) {
    try {
      User.findOneAndDelete({ _id: req.body.tuser.user_id })
        .then(() => {
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'User deleted' });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(500).send({ message: 'User not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteUserById(req: Request, res: Response) {
    try {
      const ids = req.params.ids.split(',');
      for (let i = 0; i < ids.length; i++) {
        await User.findOneAndDelete({ _id: ids[i] });
      }
      const cache = NodeLocalCache.getCache()
      cache.flushAll();
      cache.getStats();
      res.status(200).send({ message: 'User deleted' });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getUser(req: Request, res: Response) {
    try {
      User.findOne({ user_id: req.body.tuser.user_id })
        .then((user: any) => {
          user.var_password = undefined;
          res.status(200).send({ data: { ...user._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'User not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllUser(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '_users';
    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
    }
    if (req.body.sort) {
      sort = req.body.sort;
      Object.values(sort).forEach((data:any)=>{
        catcheKey += data;
      })
      Object.keys(sort).forEach((data:any)=>{
        catcheKey += data;
      })
    }
    if(req.body.search){
      catcheKey += req.body.search;
      
    }
    catcheKey += limit+page
    console.log(page, limit)
    const filter =
      req.body.search && req.body.search.length > 0
        ? {
            $and: [
              {
                $or: [
                  { var_name: { $regex: req.body.search, $options: 'i' } },
                  { var_mobile_no: { $regex: req.body.search, $options: 'i' } },
                  { var_email: { $regex: req.body.search, $options: 'i' } },
                ],
              },
              { user_type: 'user' },
            ],
          }
        : { user_type: 'user' };
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get(catcheKey ) ==undefined){
      User.find(filter)
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((users: any) => {
          User.countDocuments(filter).then((count: any) => {
            users.forEach((user: any) => {
              user.var_password = undefined;
            });
            cache.set(catcheKey,{ data: users, total: count })
            res.status(200).send({ data: users, total: count });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'User not found' });
        });
      }else{
        res.status(200).send(cache.get(catcheKey ));
     } 
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getUserById(req: Request, res: Response) {
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get( req.params.id  ) ==undefined){
      User.findOne({ _id: req.params.id })
        .then((user: any) => {
          user.var_password = undefined;
          cache.set(req.params.id,{ data: { ...user._doc } })
          res.status(200).send({ data: { ...user._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'User not found' });
        });
      }else{
        res.status(200).send(cache.get( req.params.id  ));
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
