import { Request, Response } from 'express';
import Promocode from '../../models/promocode.model';
import Order from '../../../orders/models/order.models';
import moment from 'moment';
import { logger } from '../../../commons/logger.middleware';


export class PromoCodeController {
  constructor() {}
  async getAllPromocode(req: Request, res: Response) {
    let limit = 10;
    let page = 0;

    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
    }
  
    try {
      Promocode.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_promocode: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)

        .limit(limit)
        .then((promocode: any) => {
          Promocode.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_promocode: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: promocode, total: count });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Promocode not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async validatePromo(req: Request, res: Response) {
    try {
      console.log(req.body)
    const order = await    Order.aggregate([
        { $match: {$and:[{ fk_user: req.body.tuser.user_id },{var_promocode:req.body.coupon_code}]} },]);
       
      Promocode.findOne({ var_promocode: req.body.coupon_code })
        .then((promocode: any) => {
        
          if(order.length>promocode.no_of_time){
            res.status(400).send({ message: 'No. of times limit exceeded' })
         }
         else if(moment().isAfter(moment.utc(promocode.expiry_date,'DD-MM-yyyy'))){
            res.status(400).send({  message: "Promo code expired" });
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
               
                promocode: req.body.coupon_code,
                discount_price: parseFloat(discountAmount.toFixed(2)),
                payble_amount: payablAmt,
                code_id: promocode._doc.int_glcode,
                message: 'Promo code applied successfully',
              });
            }
          
          else {
            res.status(404).send({  message: 'Minimum Order Amount is Rs ' + promocode._doc.min_order });
          }}
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Promocode not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}