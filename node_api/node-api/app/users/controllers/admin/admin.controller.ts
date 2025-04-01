/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import User from '../../models/user.model';
const { ObjectId } = require('mongodb');
import bcrypt from 'bcrypt';
import { CRYPT_SIZE } from '../../../utils/Constants';
import { dateFormate } from '../../../commons/constants';
import { logger } from '../../../commons/logger.middleware';
import { NodeLocalCache } from '../../../commons/node.cache';

export class AdminController {
  constructor() {}
  async createAdmin(req: Request, res: Response) {
    if (req.body.user_type) {
      req.body.user_type = undefined;
    }
    const myId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const user = new User({
      _id: myId,
      user_id: myId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      user_type: 'admin',
      chr_verify: false,
      ...req.body,
    });
    try {
      user
        .save()
        .then((user: any) => {
          user.var_password = undefined;
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
  async updateAdmin(req: Request, res: Response) {
    if (req.body.user_type) {
      req.body.user_type = undefined;
    }
    const cDate = moment().format(dateFormate);
    if (req.body.var_password && req.body.var_password.length > 2) {
      const salt = await bcrypt.genSalt(CRYPT_SIZE);
      const hash = await bcrypt.hash(req.body.var_password, salt);
      req.body.var_password = hash;
    }
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
  async updateAdminById(req: Request, res: Response) {
    if (req.body.user_type) {
      req.body.user_type = undefined;
    }
    const cDate = moment().format(dateFormate);
    if (req.body.var_password && req.body.var_password.length > 2) {
      const salt = await bcrypt.genSalt(CRYPT_SIZE);
      const hash = await bcrypt.hash(req.body.var_password, salt);
      req.body.var_password = hash;
    }
    const user = {
      updated_date: cDate,
      ...req.body,
    };
    try {
      User.findOneAndUpdate(
        { user_id: req.params.id },
        { $set: user },
        {
          new: true,
          upsert: true,
        },
      )
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
  async deleteAdmin(req: Request, res: Response) {
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
          res.status(404).send({ message: 'User not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteAdminById(req: Request, res: Response) {
    try {
      console.log(req.params)
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
  async getAdmin(req: Request, res: Response) {
    try {
      User.aggregate([
        { $match: { user_id: req.body.tuser.user_id } },
        {
          $lookup: {
            from: 'roles',
            as: 'role',
            let: { int_glcode: '$role_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
          },
        },
      ])
        .then((user: any) => {
          user[0].var_password = undefined;
          user[0].role = user[0].role[0];
          res.status(200).send({ data: user[0] });
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
  async getAllAdmins(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '_adminusers';
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
    console.log(page, limit)
    catcheKey += limit+page
    const filter =
      req.body.search && req.body.search.length > 0
        ? {
            $and: [
              { user_type: { $eq: 'admin' } },
              {
                $or: [
                  { var_name: { $regex: req.body.search, $options: 'i' } },
                  { var_mobile_no: { $regex: req.body.search, $options: 'i' } },
                  { var_email: { $regex: req.body.search, $options: 'i' } }
                  ,{ _id: { $regex: req.body.search, $options: 'i' } }
                  
                ],
              },
            ],
          }
        : { user_type: { $eq: 'admin' } };
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get(catcheKey ) ==undefined){
      User.aggregate([
        {
          $match: filter,
        },
        {
          $lookup: {
            from: 'roles',
            as: 'role',
            let: { int_glcode: '$role_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
          },
        },
        { $sort: sort },
        { $limit: limit + page },
        { $skip: page },
      ])
        .then((users: any) => {
          User.countDocuments(filter)
            .then((count: any) => {
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
  async getAdminById(req: Request, res: Response) {
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
