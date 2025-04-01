/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Brand from '../models/brand.model';
import { dateFormate } from '../../commons/constants';
import { logger } from '../../commons/logger.middleware';
import { NodeLocalCache } from '../../commons/node.cache';
const { ObjectId } = require('mongodb');

export class BrandController {
  constructor() { }
  async createBrand(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const brand = new Brand({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      viewCount: 0,
      var_slug: req.body.var_title.toString().replace(' ', '-'),
      soldCount: 0,
      ...req.body,
    });
    try {
      brand
        .save()
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Brand created' });
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
  async updateBrandById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    let brand;
    if (req.file) {
      brand = {
        updated_date: cDate,
        ...req.body,
      };
    } else {
      brand = {
        updated_date: cDate,
        ...req.body,
      };
    }
    try {
      Brand.findOneAndUpdate(
        { int_glcode: req.params.id },
        {
          $set: brand,
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
          res.status(200).send({ message: 'Brand updated' });
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
  async deleteBrandById(req: Request, res: Response) {
    try {
      const ids = req.params.ids.split(',');
      for (let i = 0; i < ids.length; i++) {
        await Brand.findOneAndDelete({ _id: ids[i] });
      }
      const cache = NodeLocalCache.getCache();
      cache.flushAll();
      cache.getStats();
      res.status(200).send({ message: 'Brand deleted' });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllBrand(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '_brand';
    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
    }
    if (req.body.sort) {
      sort = req.body.sort;
      Object.values(sort).forEach((data: any) => {
        catcheKey += data;
      })
      Object.keys(sort).forEach((data: any) => {
        catcheKey += data;
      })
    }
    if (req.body.search) {
      catcheKey += req.body.search;

    }
    catcheKey += limit + page
    try {
      const cache = NodeLocalCache.getCache();
      if (cache.get(catcheKey) == undefined) {
        const brand = Brand.find(
          req.body.search && req.body.search.length > 0
            ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }, { int_glcode: { $regex: req.body.search, $options: 'i' } }],
            }
            : {},
        );
        if (req.body.page) {
          brand.skip(page)
        }
        brand.sort(sort)
        if (req.body.limit) {
          brand.limit(limit)
        }
        brand.then((brands: any) => {
          Brand.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }, { int_glcode: { $regex: req.body.search, $options: 'i' } }],
              }
              : {},
          ).then((count: any) => {
            cache.set(catcheKey, { data: brands, total: count })
            res.status(200).send({ data: brands, total: count });
          });
        })
          .catch((e) => {
            logger.error('', e);
            res.status(404).send({ message: 'Brand not found' });
          });
      } else {
        res.status(200).send(cache.get(catcheKey));
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getBrandById(req: Request, res: Response) {
    try {
      const cache = NodeLocalCache.getCache();
      if (cache.get(req.params.id) == undefined) {
        Brand.findOne({ _id: req.params.id })
          .then((brand: any) => {
            cache.set(req.params.id, { data: { ...brand._doc } })
            res.status(200).send({ data: { ...brand._doc } });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(404).send({ message: 'Brand not found' });
          });
      } else {
        res.status(200).send(cache.get(req.params.id));
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
