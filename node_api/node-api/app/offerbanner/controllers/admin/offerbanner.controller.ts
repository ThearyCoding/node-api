/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import OfferBanner from '../../models/offerbanner.model';
import { dateFormate } from '../../../commons/constants';
import { NodeLocalCache } from '../../../commons/node.cache';
const { ObjectId } = require('mongodb');

export class OfferBannerController {
  constructor() {}
  async createOfferBaner(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const banner = new OfferBanner({
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
          res.status(200).send({ message: 'Offer banner created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateOfferBannerById(req: Request, res: Response) {
    const cDate = moment().format('MM ddd, YYYY HH:mm:ss');
    const banner = new OfferBanner({
      updated_date: cDate,
      ...req.body,
    });
    try {
      OfferBanner.findOneAndUpdate({ int_glcode: req.params.id }, banner, {
        new: true,
        upsert: true,
      })
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Offer banner updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteOfferBannerById(req: Request, res: Response) {
    try {
      OfferBanner.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Offer banner deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Offer banner not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllOfferBanner(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '_offerbanner';
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
          OfferBanner.find(
            req.body.search && req.body.search.length > 0
              ? {
                  $and: [{ var_title: { $regex: req.body.search, $options: 'i' } },{
                               
                  }],
                }
              : {
                              
              },
          )
            .skip(page)
            .sort(sort)
            .limit(limit)
            .then((offersBanners: any) => {
              
              OfferBanner.countDocuments(
                req.body.search && req.body.search.length > 0
                  ? {
                      $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                    }
                  : {},
              ).then((count: any) => {
                cache.set(catcheKey,{ data: offersBanners, total: count })
                res.status(200).send({ data: offersBanners, total: count });
              });
            })
            .catch(() => {
              res.status(404).send({ message: 'Offer banner not found' });
            });
      }else{
            res.status(200).send(cache.get(catcheKey ));
       }        
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getOfferBannerById(req: Request, res: Response) {
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get( req.params.id  ) ==undefined){
        OfferBanner.findOne({ _id: req.params.id })
          .then((banner: any) => {
            cache.set(req.params.id,{ data: { ...banner._doc } })
            res.status(200).send({ data: { ...banner._doc } });
          })
          .catch(() => {
            res.status(404).send({ message: 'Offer banner not found' });
          });
      }else{
        res.status(200).send(cache.get( req.params.id  ));
      }
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
