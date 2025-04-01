import { Request, Response } from 'express';
import User from '../../models/user.model';
import moment from 'moment';
const { ObjectId } = require('mongodb');
import bcrypt from 'bcrypt';
import { CRYPT_SIZE } from '../../../utils/Constants';
import { dateFormate } from '../../../commons/constants';
import { signInJwt } from '../../../utils/jwt_utils';
import { accessTokenExpTime } from '../../../utils/Constants';
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
      user_type: 'user',
      is_active: true,
      ...req.body,
    });
    try {
      user
        .save()
        .then((user: any) => {
          const accessToken = signInJwt(
            {
              uid: user.user_id,
              email: user.var_email,
            },
            { expiresIn: accessTokenExpTime },
          );
          user.var_password = undefined;
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ status: 1, message: 'User created', data: { ...user._doc, accessToken: accessToken } });
        })
        .catch((e) => {
          logger.error('', e);
          if (e.code === 11000 && e.keyPattern.var_email === 1) {
            res.status(200).send({ status: 0, message: 'Email already exist' });
          } else if (e.code === 11000 && e.keyPattern.var_mobile_no === 1) {
            res.status(200).send({ status: 0, message: 'Mobile number already exist' });
          } else {
            res.status(200).send({ status: 0, message: e });
          }
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Error while creating user.' });
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
    const user = new User({
      updated_date: cDate,
      ...req.body,
    });
    try {
      User.findOneAndUpdate({ user_id: req.body.tuser.user_id }, user, {
        new: true,
        upsert: true,
      })
        .then(async () => {
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ status: 1, message: 'Profile updated successfully.' });
        })
        .catch((e) => {
          logger.error('', e);
          if (e.code === 11000 && e.keyPattern.var_email === 1) {
            res.status(200).send({ status: 0, message: 'Email already exist' });
          } else if (e.code === 11000 && e.keyPattern.var_mobile_no === 1) {
            res.status(200).send({ status: 0, message: 'Mobile number already exist' });
          } else {
            res.status(200).send({ status: 0, message: 'Unexpected error' });
          }
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }

  async changePassword(req: Request, res: Response) {
    const isValid = await bcrypt.compare(req.body.var_cpassword, req.body.tuser.var_password);
    if (isValid) {
      const cDate = moment().format(dateFormate);

      const salt = await bcrypt.genSalt(CRYPT_SIZE);
      const hash = await bcrypt.hash(req.body.var_npassword, salt);
      const password = hash;

      if (req.body.user_type) {
        req.body.user_type = 'user';
      }
      const user = {
        updated_date: cDate,
        var_password: password,
      };
      try {
        User.findOneAndUpdate(
          { user_id: req.body.tuser.user_id },
          { $set: user },
          {
            new: true,
            upsert: true,
          },
        )
          .then(async () => {
            res.status(200).send({ status: 1, message: 'Password changed' });
          })
          .catch((e) => {
            if (e.code === 11000 && e.keyPattern.var_email === 1) {
              res.status(200).send({ status: 0, message: 'Email already exist' });
            } else if (e.code === 11000 && e.keyPattern.var_mobile_no === 1) {
              res.status(200).send({ status: 0, message: 'Mobile number already exist' });
            } else {
              res.status(200).send({ status: 0, message: 'Unexpected error' });
            }
          });
      } catch (e) {
        logger.error('', e);
        res.status(200).send({ status: 0, message: 'Unexpected error' });
      }
    } else {
      
      return res.status(200).send({ status: 0, message: 'Invalid old  password' });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      User.findOne({ user_id: req.body.tuser.user_id })
        .then((user: any) => {
          user.var_password = undefined;
          const accessToken = signInJwt(
            {
              uid: user.user_id,
              email: user.var_email,
            },
            { expiresIn: accessTokenExpTime },
          );

          res.status(200).send({ status: 1, message: 'Data found', data: { ...user._doc, accessToken } });
        })
        .catch(() => {
          res.status(200).send({ status: 0, message: 'User not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
  async deleteUser(req: Request, res: Response) {
    try {
      User.findOneAndDelete({ _id: req.body.tuser.user_id })
        .then(() => {
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ status: 1, message: 'User deleted' });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(200).send({ status: 0, message: 'User not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
}
