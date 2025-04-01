/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Promocode from '../../models/promocode.model';
import { dateFormate } from '../../../commons/constants';
import Order from '../../../orders/models/order.models';
import { logger } from '../../../commons/logger.middleware';
import { NodeLocalCache } from '../../../commons/node.cache';
const { ObjectId } = require('mongodb');

export class PromoCodeController {
  constructor() {}
  async createPromocode(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    
    const promocode = new Promocode({
      _id: cId,
      int_glcode: cId.toString(),
      dt_createddate: cDate,
      dt_modifydate: cDate,
      ...req.body,
    });
    try {
      promocode
        .save()
        .then(() => {
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Promocode created' });
        })
        .catch((e) => {
          logger.error('', e);
          if (e.code === 11000) {
            res.status(400).send({ message: 'Promocode already exist with this name.' });
          } else{
             res.status(400).send({ message: e });
          }
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updatePromocodeById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const attribute = {
      dt_modifydate: cDate,
      ...req.body,
    };
    try {
      Promocode.findOneAndUpdate({ int_glcode: req.params.id }, attribute, {
        new: true,
        upsert: true,
      })
        .then(() => {
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Promocode updated' });
        })
        .catch((e) => {
        
          if (e.code === 11000) {
            res.status(400).send({ message: 'Promocode already exist with this name.' });
          } else{
            res.status(400).send({ message: e });
          }
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deletePromocodeById(req: Request, res: Response) {
    try {
      const ids = req.params.ids.split(',');
      for (let i = 0; i < ids.length; i++) {
        await Promocode.findOneAndDelete({ _id: ids[i] });
      }
      const cache = NodeLocalCache.getCache()
      cache.flushAll();
      cache.getStats();
      res.status(200).send({ message: 'Promocode deleted' });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllPromocode(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '_promocode';
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
      Promocode.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_promocode: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((promocode: any) => {
          Promocode.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_promocode: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            cache.set(catcheKey,{  data: promocode, total: count })
            res.status(200).send({ data: promocode, total: count });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Promocode not found' });
        });
      }else{
        res.status(200).send(cache.get(catcheKey ));
     } 
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getPromocodeById(req: Request, res: Response) {
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get( req.params.id  ) ==undefined){
      Promocode.findOne({ _id: req.params.id })
        .then((promocode: any) => {
          cache.set(req.params.id,{ data: { ...promocode._doc } })
          res.status(200).send({ data: { ...promocode._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Promocode not found' });
        });
      }else{
        res.status(200).send(cache.get( req.params.id  ));
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async validatePromo(req: Request, res: Response) {
    try {
    const order = await    Order.aggregate([
        { $match: {$and:[{ fk_user: req.body.tuser.user_id },{var_promocode:req.body.coupon_code}]} },]);
       
      Promocode.findOne({ var_promocode: req.body.coupon_code })
        .then((promocode: any) => {
          if(!promocode.chr_publish){
            res.status(200).send({ status: 0, message: 'Promo code not valid' })
         }
         
          else if(order.length>promocode.no_of_time){
            res.status(200).send({ status: 0, message: 'No. of times limit exceeded' })
         }
         else if(moment(moment.utc(moment().format("DD-MM-yyyy"),'DD-MM-yyyy')).isAfter(moment.utc(promocode.expiry_date,'DD-MM-yyyy'))){
            res.status(200).send({ status: 0, message: "Promo code expired" });
         }
         else{
            let discountAmount: number = 0;
          
            if (req.body.total_amount > promocode._doc.min_order) {
              discountAmount = (promocode.var_percentage / 100) * (parseFloat(req.body.total_amount)-parseFloat(req.body.total_discount));
              if (discountAmount > promocode._doc.max_discount_price) {
                discountAmount = promocode._doc.max_discount_price;
              }
              const total_amount = parseFloat(req.body.total_amount) + parseFloat(req.body.total_tax);
              let payablAmt = total_amount - ((parseFloat(discountAmount.toFixed(2)) + parseFloat(req.body.total_discount)))+parseFloat(req.body.delivery_charge);
              if(payablAmt<0){
                payablAmt = 0;
              }
              res.status(200).send({
                status: 1,
                promocode: req.body.coupon_code,
                discount_price: parseFloat(discountAmount.toFixed(2)),
                payble_amount: payablAmt,
                code_id: promocode._doc.int_glcode,
                message: 'Promo code applied successfully',
              });
            }
          
          else {
            res.status(200).send({ status: 0, message: 'Minimum Order Amount is Rs ' + promocode._doc.min_order });
          }}
        })
        .catch((e) => {
          logger.error('', e);
          res.status(200).send({ status: 0, message: 'Promocode not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(2000).send({ status: 0, message: 'Unexpected error' });
    }
  }
}
