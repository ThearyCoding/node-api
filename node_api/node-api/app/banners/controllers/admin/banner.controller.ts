/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Banner from '../../models/banner.model';
import { logger } from '../../../commons/logger.middleware';
import { NodeLocalCache } from '../../../commons/node.cache';
const { ObjectId } = require('mongodb');

export class BannerController {
  constructor() {}
  async createBaner(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format('MM ddd, YYYY HH:mm:ss');
    const banner = new Banner({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      ...req.body,
    });
    try {
      banner
        .save()
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Banner created' });
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
  async updateBannerById(req: Request, res: Response) {
    const cDate = moment().format('MM ddd, YYYY HH:mm:ss');
    const banner = new Banner({
      updated_date: cDate,
      ...req.body,
    });
    try {
      Banner.findOneAndUpdate({ int_glcode: req.params.id }, banner, {
        new: true,
        upsert: true,
      })
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Banner updated' });
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
  async deleteBannerById(req: Request, res: Response) {
    try {
      Banner.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Banner deleted' });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Banner not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllBanner(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '_banner';
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
        Banner.find(
          req.body.search && req.body.search.length > 0
            ? {
                $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
              }
            : {},
        )
          .skip(page)
          .sort(sort)
          .limit(limit)
          .then((banners: any) => {
            Banner.countDocuments(
              req.body.search && req.body.search.length > 0
                ? {
                    $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                  }
                : {},
            ).then((count: any) => {
              cache.set(catcheKey,{ data: banners, total: count })
              res.status(200).send({ data: banners, total: count });
            });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(404).send({ message: 'Banner not found' });
          });
        }else{
          res.status(200).send(cache.get(catcheKey ));
        }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getBannerById(req: Request, res: Response) {
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get( req.params.id  ) ==undefined){
      Banner.findOne({ _id: req.params.id })
        .then((banner: any) => {
          cache.set(req.params.id,{ data: { ...banner._doc } })
          res.status(200).send({ data: { ...banner._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Banner not found' });
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
