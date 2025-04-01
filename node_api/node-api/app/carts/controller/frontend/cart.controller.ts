/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Cart from '../../models/cart.model';
import { dateFormate } from '../../../commons/constants';
import Product from '../../../products/models/product.model';
import DeliveryCharge from '../../../deliverycharge/models/deliverycharge.model';
import { logger } from '../../../commons/logger.middleware';
const { ObjectId } = require('mongodb');

export class CartController {
  constructor() {}
  async createUpdateCart(req: Request, res: Response) {
    const product = await Product.findOne({ _id: req.body.fk_product });
    if (product && parseInt(product.variants[product.variants.findIndex((data)=>data.int_glCode=== req.body.fk_variant)].stock?product.variants[product.variants.findIndex((data)=>data.int_glCode=== req.body.fk_variant)].stock:"0") < req.body.var_qty) {
      res.status(404).send({  message: 'Sorry, could not proceed due to out of stock' });
    } else {
      if (product && product.variants.find((v: any) => v.int_glCode === req.body.fk_variant)) {
        if (req.body.var_qty > 0) {
          Cart.findOne({
            $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: req.body.fk_product },{fk_verient:req.body.fk_variant}],
          }).then((cart: any) => {
            
            if (cart) {
              Cart.findOneAndUpdate(
                { int_glcode: cart._id.toString() },
                { var_unit: req.body.var_qty },
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
                fk_verient: req.body.fk_variant,
                fk_product: req.body.fk_product,
                var_unit: req.body.var_qty,
              });
              try {
                cart
                  .save()
                  .then(() => {
                    res.status(200).send({  message: 'Cart added' });
                  })
                  .catch((e) => {
                    console.log("err",e)
                    res.status(404).send({  message: e });
                  });
              } catch (e) {
                res.status(500).send({  message: 'Unexpected error' });
              }
            }
          });
        } else {
          Cart.findOne({
            $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: req.body.fk_product }],
          }).then((cart: any) => {
            Cart.findOneAndDelete({ _id: cart._id }).then(() => {
              res.status(200).send({ message: 'Cart item removed' });
            });
          });
        }
      } else {
        res.status(400).send({  message: 'Enter valid product id and variant id' });
      }
    }
  }

  async countCarts(req: Request, res: Response) {
    try {
      Cart.countDocuments({ fk_user: req.body.tuser.user_id }).then((count: any) => {
        res.status(200).send({ message: 'Success', data: count.toString() });
      });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({  message: 'Unexpected error' });
    }
  }

  async deleteCarts(req: Request, res: Response) {
    try {
      console.log(req.params)
      if (req.params.fk_product && req.params.fk_variant) {
        Cart.aggregate([{$match:{
          $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: req.params.fk_product }, { fk_verient: req.params.fk_variant }],
        }}]).then(async (cart: any) => {
          for(let i = 0; i<cart.length; i++){
           await Cart.findOneAndDelete({ int_glcode: cart[i].int_glcode })
          }
      
          res.status(200).send({  message: 'Cart deleted' });
           
        });
      } else {
        Cart.deleteMany({ fk_user: req.body.tuser.user_id })
          .then(() => {
            res.status(200).send({ message: 'Cart deleted' });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(404).send({  message: 'Cart not found' });
          });
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllCarts(req: Request, res: Response) {
    try {
      console.log("req",req.body)
    
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
      ]).then(async (cart: any) => {
        const products: any = [];
        let totalAmount = 0;
        let taxAmount = 0;
        let discountAmount: number = 0;
        cart.forEach((data: any) => {
        
          const product: any = data.product[0];
       
          const variant = product.variants.find((v: any) => v.int_glCode === data.fk_verient);
          if(variant){
            product.is_variant = '1';
            product.var_price =variant.price;
            product.selling_price = variant.selling_price;
            product.start_date = '0000-00-00';
            product.end_date = '0000-00-00';
            product.cartItem = data.var_unit;

            if (req.body.tuser && product.wishList) {
              product.like = product.wishList.find((data: any) => data === req.body.tuser.user_id) !== undefined ? 'Y' : 'N';
            } else {
              product.like = 'N';
            }
            product.totalRatting = 0;
            product.ratting = 0;
          
            product.var_stock = variant.stock;
            
            product.variant_id = variant.int_glCode;
            product.fk_product= product.int_glcode,
            product.var_image = variant.image[0];
            product.Variant_details = {
              int_glcode: variant.int_glCode,
              fk_product: product.int_glcode,
              variant_id: variant.int_glcode,
              var_stock: variant.stock,
              var_price: variant.price,
              attributes:variant,
              selling_price: variant.selling_price,
              start_date: '0000-00-00',
              end_date: '0000-00-00',
              cartItem: data.var_unit,
            };
            if (product.txt_nutrition) {
              /* empty */
            } else {
              product.txt_nutrition = '';
            }

            const price = parseInt(variant.selling_price);
            let pTax = 0;
            if (parseInt(product.var_gst) > 0) {
              pTax = (parseInt(product.var_gst) / 100) * (price * parseInt(data.var_unit));
              taxAmount += pTax;
            }
            discountAmount += parseInt(variant.price) * parseInt(data.var_unit);
            totalAmount += price * parseInt(data.var_unit);
            delete product.fk_tags;
            delete product.variants;
            delete product.wishList;
            products.push(product);
       
          }else{
             Cart.findOneAndDelete({ int_glcode: data.int_glcode })
          }
        });
       
        const payablAmt = discountAmount;
        discountAmount = discountAmount - totalAmount;
        const delivery_charge = await DeliveryCharge.find();
        const deliveryCharge: any = await DeliveryCharge.find();
        const deliveryAmount = parseInt(deliveryCharge[0].var_charges);
        const payableAmount = totalAmount + taxAmount+ deliveryAmount;
      

        res.status(200).send({
          message: 'Succcess',
          data: products,
          Sub_Total: payablAmt.toFixed(2),
          discount_total: discountAmount.toFixed(2),
          gst_total: taxAmount.toFixed(2),
          gross_total: payableAmount.toFixed(2),
          delivery_charge:delivery_charge[0].var_charges
        });
      });
    } catch (e) {
  
      logger.error('', e);
      res.status(500).send({ status: 0, message: 'Unexpected error' });
    }
  }
}
