/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Attribute from '../../models/attribute.model';
import { dateFormate } from '../../../commons/constants';
import { logger } from '../../../commons/logger.middleware';
import { NodeLocalCache } from '../../../commons/node.cache';
const { ObjectId } = require('mongodb');

export class AttributeController {
  constructor() {}
  async createAttribute(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const attribute = new Attribute({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      ...req.body,
    });
    try {
      attribute
        .save()
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Attribute created' });
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
  async updateAttributeById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);

    try {
      Attribute.findOneAndUpdate(
        { int_glcode: req.params.id },
        {
          $set: {
            updated_date: cDate,
            ...req.body,
          },
        },
        {
          new: false,
          overwrite: true,
        },
      )
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Attribute updated' });
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
  async deleteAttributeById(req: Request, res: Response) {
    try {
      const ids = req.params.ids.split(',');
      for (let i = 0; i < ids.length; i++) {
        await Attribute.findOneAndDelete({ $and: [{ _id: ids[i] }, { is_deletable: true }] });
      }
      const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
      res.status(200).send({ message: 'Attribute deleted' });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllAttribute(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '_attribute';
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
    
    try {
     const cache = NodeLocalCache.getCache();
     if(cache.get(catcheKey ) ==undefined){
      Attribute.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((attributes: any) => {
          Attribute.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            cache.set(catcheKey,{ data: attributes, total: count })
            res.status(200).send({ data: attributes, total: count });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Attribute not found' });
        });
      }else{
        res.status(200).send(cache.get(catcheKey ));
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }

  async getAllAttributeWithValues(req: Request, res: Response) {
    try {
      
      Attribute.aggregate([
        {
          $lookup: {
            from: 'attributes_values',
            localField: 'int_glcode',
            foreignField: 'attribute_id',
            as: 'values',
          },
        },
      ])

        .then((attributes: any) => {
          Attribute.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: attributes, total: count });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Attribute not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAttributeById(req: Request, res: Response) {
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get( req.params.id  ) ==undefined){
        Attribute.findOne({ _id: req.params.id })
          .then((attribute: any) => {
            cache.set(req.params.id,{ data: { ...attribute._doc } })
            res.status(200).send({ data: { ...attribute._doc } });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(404).send({ message: 'Attribute not found' });
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
