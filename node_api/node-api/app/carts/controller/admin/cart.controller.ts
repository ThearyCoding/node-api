/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Cart from '../../models/cart.model';
import { dateFormate } from '../../../commons/constants';
import { logger } from '../../../commons/logger.middleware';
const { ObjectId } = require('mongodb');

export class CartController {
  constructor() {}
  async createUpdateCart(req: Request, res: Response) {
    if (req.body.var_unit > 0) {
      Cart.findOne({
        $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: req.body.fk_product }],
      }).then((cart: any) => {
        if (cart) {
          Cart.findOneAndUpdate(
            { int_glcode: cart._id.toString() },
            { var_unit: req.body.var_unit },
            {
              new: true,
              upsert: true,
            },
          ).then(() => {
            res.status(200).send({ message: 'Cart updated' });
          });
        } else {
          const cId = new ObjectId();
          const cDate = moment().format(dateFormate);
          const cart = new Cart({
            _id: cId,
            int_glcode: cId.toString(),
            created_date: cDate,
            updated_date: cDate,
            fk_user: req.body.tuser.user_id,
            is_active: true,
            ...req.body,
          });
          try {
            cart
              .save()
              .then(() => {
                res.status(200).send({ message: 'Cart added' });
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
      });
    } else {
      res.status(400).send({ message: 'Quantity not less then one' });
    }
  }
  async deleteCartById(req: Request, res: Response) {
    try {
      Cart.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Cart deleted' });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Cart not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllCarts(req: Request, res: Response) {
    try {
      Cart.aggregate([
        { $match: { fk_user: req.body.tuser.user_id } },
        {
          $lookup: {
            from: 'products',
            as: 'product',
            let: { int_glcode: '$fk_product' },
            pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
          },
        },
      ])
        .then((carts: any) => {
          carts.forEach((cart: any) => {
            if (cart.product.length > 0) {
              cart.product = cart.product[0];
            }
          });
          res.status(200).send({ data: carts });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Cart not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
