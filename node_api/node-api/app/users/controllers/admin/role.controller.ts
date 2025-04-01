/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
const { ObjectId } = require('mongodb');
import { dateFormate } from '../../../commons/constants';
import UserRole from '../../models/role.model';
import { logger } from '../../../commons/logger.middleware';

export class RoleController {
  constructor() {}
  async createRole(req: Request, res: Response) {
    if (req.body.user_type) {
      req.body.user_type = undefined;
    }
    const myId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const role = new UserRole({
      _id: myId,
      int_glcode: myId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      ...req.body,
    });
    try {
      role
        .save()
        .then((user: any) => {
          user.var_password = undefined;
          res.status(200).send({ message: 'Role created' });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(500).send({ message: e });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }

  async updateRoleById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const role = {
      updated_date: cDate,
      ...req.body,
    };
    try {
      UserRole.findOneAndUpdate(
        { int_glcode: req.params.id },
        { $set: role },
        {
          new: true,
          upsert: true,
        },
      )
        .then(() => {
          res.status(200).send({ message: 'Role updated' });
        })
        .catch(() => {
          res.status(500).send({ message: 'Unexpected error' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteRoleById(req: Request, res: Response) {
    try {
      const ids = req.params.ids.split(',');
      for (let i = 0; i < ids.length; i++) {
        await UserRole.findOneAndDelete({ _id: ids[i] });
      }
      res.status(200).send({ message: 'Role deleted' });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getRole(req: Request, res: Response) {
    try {
      UserRole.findOne({ user_id: req.params.id })
        .then((user: any) => {
          res.status(200).send({ data: { ...user._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(500).send({ message: 'Role not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllRoles(req: Request, res: Response) {
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
    const filter =
      req.body.search && req.body.search.length > 0
        ? {
            $or: [{ lable: { $regex: req.body.search, $options: 'i' } }],
          }
        : {};
    try {
      UserRole.aggregate([
        {
          $match: filter,
        },

        { $sort: { date: -1 } },
        { $limit: limit + page },
        { $skip: page },
      ])
        .then((users: any) => {
          UserRole.countDocuments(filter)
            .skip(page)
            .sort(sort)
            .limit(limit)
            .then((count: any) => {
              res.status(200).send({ data: users, total: count });
            });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Role not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getRoleById(req: Request, res: Response) {
    try {
      UserRole.findOne({ _id: req.params.id })
        .then((user: any) => {
          user.var_password = undefined;
          res.status(200).send({ data: { ...user._doc } });
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
}
