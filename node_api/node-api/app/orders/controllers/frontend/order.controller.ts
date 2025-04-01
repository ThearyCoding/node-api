/* eslint-disable indent */
import { Request, Response } from 'express';
import Cart from '../../../carts/models/cart.model';
import Promocode from '../../../promocode/models/promocode.model';
import DeliveryCharge from '../../../deliverycharge/models/deliverycharge.model';
import { ObjectId } from 'mongodb';
import moment from 'moment';
import Order from '../../models/order.models';
import Address from '../../../address/models/address.model';
import crypto from 'crypto';
import { CommonFunction, dateFormate } from '../../../commons/constants';
import Invoice from '../../models/invoice.models';
import OrderComment from '../../models/comment.models';
import Product from '../../../products/models/product.model';
import ReturnOrder from '../../models/returnorder.model';
import { logger } from '../../../commons/logger.middleware';


export class OrderController {
  constructor() {}

 
  async fcTest(req: Request, res: Response) {
    try{
      
      const token = await new CommonFunction().sendFcmMessage('cNAtYksyRSSyyePCc1-cNi:APA91bGRYAyvn5GtGzIPsJD-dGlUvKddZTM2-QoWttAP-CvkF7NAtanG5DRNtDvvCYKUvPQP34t63mK15pf46ttsQAQ8KsO5v5IwnIppROLFT0rMD8WbkY48usr3rN2B2varzYtV9JFX',{"title":"test",body:"sdfds"});
   
      res.status(200).send(token)
    }catch(e){
      console.log("error",e)
      res.status(400).send(e)
    }
     
  }
  async createOrder(req: Request, res: Response) {
  
    const products: Array<any> = [];
    let totalAmount = 0;
    let taxAmount = 0;
    let subTotal = 0;
    let discountAmount =0;
    let deliveryAmount: number = 0;
    const carts: any = await Cart.aggregate([
      { $match: { fk_user: req.body.tuser.user_id } },
      {
        $lookup: {
          from: 'products',
          as: 'product',
          let: { int_glcode: '$fk_product' },
          pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
        },
      },
    ]);
   
    carts.forEach((cart: any) => {
      try{
      if (cart.product[0] !== undefined) {
        cart.product = cart.product[0];
        const variant = cart.product.variants.find((data: any) => data.int_glCode === cart.fk_verient);
        console.log(variant)
        const price = parseFloat(variant.selling_price);
        subTotal+=parseFloat(variant.price);
        let pTax = 0;
        if (parseFloat(cart.product.var_gst) > 0) {
          pTax = (parseFloat(cart.product.var_gst) / 100) * (price * parseInt(cart.var_unit));
          cart.product.tax_amount = (parseFloat(cart.product.var_gst) / 100) * (price * parseInt(cart.var_unit));
          taxAmount += pTax;
        } else {
          cart.product.tax_amount = 0;
        }
        cart.product.variants = variant;
        discountAmount += parseFloat(variant.price) - parseFloat(variant.selling_price);
        cart.product.var_unit = cart.var_unit;
        cart.product.total_amount = price * parseInt(cart.var_unit) + pTax;
        products.push(cart.product);
        totalAmount += price * parseInt(cart.var_unit);
      }
      }catch(e){
        console.log(e)
      }
    });
  
    if (products.length > 0) {
      let promoDiscountAmount: any = 0;
      if (req.body.var_promocode) {
        const promocode: any = await Promocode.findOne({ var_promocode: req.body.var_promocode });
        if (parseInt(promocode.min_order) <= totalAmount) {
          promoDiscountAmount = (promocode.var_percentage / 100) * totalAmount;
          if (promoDiscountAmount > promocode.max_discount_price) {
            promoDiscountAmount = promocode.max_discount_price;
          }
        }
      }
      const userAddress: any = await Address.findOne({ int_glcode: req.body.var_adress_id });
      req.body.var_adress_id = userAddress;
      const deliveryCharge: any = await DeliveryCharge.find();
      deliveryAmount = parseInt(deliveryCharge[0].var_charges);
     console.log(totalAmount , parseFloat(req.body.shipping_charge) , deliveryAmount , taxAmount , promoDiscountAmount)
      const payableAmount = totalAmount + parseFloat(req.body.shipping_charge) + deliveryAmount + taxAmount - promoDiscountAmount;
      const cId = new ObjectId();
      const cDate = moment().format(dateFormate);
      const orderID = '#ORD' + crypto.randomInt(100000000, 900000000).toString();
    
     
      const order = new Order({
        _id: cId,
        int_glcode: cId.toString(),
        dt_createddate: cDate,
        order_id: orderID,
        is_active: true,
        var_user_address: req.body.var_adress_id,
        var_address_type: userAddress.chr_type,
        fk_user: req.body.tuser.user_id,
        fk_product_arr: products,
        create_date: moment().format('YYYY-MM-DD'),
        register_contact: req.body.var_phone,
        var_delivery_charge: deliveryAmount.toFixed(2),
        var_wallet_amount: 0,
        var_promocode: req.body.var_promocode ? req.body.var_promocode : '',
        var_discount_amount: discountAmount.toFixed(2),
        var_tax: taxAmount.toFixed(2),
        var_promo_discount: promoDiscountAmount.toFixed(2),
        var_payment_id: req.body.var_payment_id,
        var_total_amount: subTotal.toFixed(2),
        var_payable_amount: payableAmount.toFixed(2),
        var_payment_mode: req.body.var_payment_mode,
        var_cashback: req.body.cashback,
        chr_status: 'A',
        ...req.body,
      });

      try {
        order
          .save()
          .then(async () => {
            for (let j = 0; j < products.length; j++) {
              await Product.updateOne(
                { int_glcode: products[j].int_glcode, 'variants.int_glCode': products[j].variants.int_glCode },
                {
                  $set: {
                    sold_count: products[j].sold_count + 1,
                    'variants.$.stock': `${parseInt(products[j].variants.stock) - products[j].var_unit}`,
                  },
                },
                {
                  new: false,
                  upsert: true,
                },
              ).then((ress) => console.log(ress));
            }
            const iId = new ObjectId();
            const iDate = moment().format(dateFormate);
            const ivID = crypto.randomInt(100000000, 900000000).toString();
            const invoice = new Invoice({
              _id: iId,
              int_glcode: iId.toString(),
              order_id: orderID,
              invoice_id: ivID,
              dt_createddate: iDate,
              dt_orderdate: cDate,
              customer: {
                user_id: req.body.tuser.user_id,
                var_mobile_no: req.body.tuser.var_mobile_no,
                var_email: req.body.tuser.var_email,
                var_name: req.body.tuser.var_name,
              },
              status: 'P',
              amount: payableAmount.toFixed(2),
              payment_method: req.body.var_payment_mode,
            });
            invoice.save().then(async () => {});
             new CommonFunction().sendFcmMessage(req.body.tuser.var_device_token,{title:"Order created",body:"Your order created with order id "+orderID});
   
            Cart.deleteMany({ fk_user: req.body.tuser.user_id }).then((ress) => console.log(ress));
            res.status(200).send({  message: 'Order created' });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(400).send({  message: e });
          });
      } catch (e) {
        logger.error('', e);
        res.status(500).send({  message: 'Unexpected error' });
      }
    } else {
      res.status(404).send({  message: 'Your cart is empty' });
    }
  }

  async cancelOrder(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const order = {
      updated_date: cDate,
      chr_status: 'C',
    };
    try {
      Order.findOneAndUpdate({ int_glcode: req.params.id }, order, {
        new: true,
        upsert: true,
      })
        .then(() => {
          new CommonFunction().sendFcmMessage(req.body.tuser.var_device_token,{title:"Order cancelled",body:"Your order("+req.body.order_id+") is cancelled"});
          res.status(200).send({  message: 'Order cancelled' });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(400).send({  message: e });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({message: 'Unexpected error' });
    }
  }

  async returnOrder(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const order = {
      updated_date: cDate,
      chr_status: 'D',
    };
    try {
      Order.findOneAndUpdate({ int_glcode: req.body.order_id }, order, {
        new: true,
        upsert: true,
      })
        .then(async () => {
          const cId = new ObjectId();
          const comment = new OrderComment({
            _id: cId,
            dt_createddate: cDate,
            int_glcode: cId,
            order_id: req.body.order_id,
            message: req.body.return_text,
            status: 'D',
          });
          try {
            comment.save().then(async (e) => {
            });
          let order:any =   await Order.aggregate( [{ $unwind: "$fk_product_arr" },
            {$match:{"int_glcode":req.body.order_id, "fk_product_arr.int_glcode":req.body.fk_product,"fk_product_arr.variants.int_glCode":req.body.fk_variant }}, {
              "$set": {
                "instock": {
                  "$filter": {
                    "input": ["fk_product_arr"],
                    "cond": {
                      "$eq": [
                        "$$this.fk_product_arr.variants.int_glCode",
                        req.body.fk_variant
                      ]
                  }
                }
              }
            }}])
            order = order[0];
              if(order){
              
              let var_gst = order.fk_product_arr.var_gst;
              let selleing_price = parseFloat(order.fk_product_arr.variants.selling_price);
              let unit = order.fk_product_arr.var_unit;
              const tax_amount = (parseInt(var_gst) / 100) * (selleing_price * parseInt(unit));
              const payableAmount = parseFloat(tax_amount.toFixed(2))+ selleing_price;
              const rId = new ObjectId();
              const rDate = moment().format(dateFormate);
              const returnOrder = new ReturnOrder({
                _id: rId,
                int_glcode: rId,
                order_id: order.order_id,
                customer_comment: req.body.return_text,
                order_inglcode:order.int_glcode,
                fk_user: order.fk_user,
                return_id: `${Math.floor(Math.random() * (10000000000 - 10000000 + 1)) + 10000000}`,
                fk_product_arr: order.fk_product_arr,
                chr_status: 'A',
                var_total_amount: (selleing_price * parseInt(unit)).toFixed(2),
                var_payable_amount: payableAmount,
                var_tax: tax_amount.toFixed(2),
                paid_status: 'N',
                dt_paid: '',
                dt_createddate: rDate,
                var_ipaddress: ''
              });
              returnOrder
              .save()
              .then(async () => {
                new CommonFunction().sendFcmMessage(req.body.tuser.var_device_token,{title:"Order returned",body:"Your order("+req.body.order_id+") is returned"});
                res.status(200).send({  message: 'Order return successfully.' });
              })
            }else{
              res.status(200).send({  message: 'Order not found.' });
            }
          } catch (e) {
            /* empty */
            logger.error('', e);
            console.log(e)
          }
          
        })
        .catch((e) => {
          logger.error('', e);
          res.status(200).send({ status: 0, message: e });
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }

  async addProductReview(req: Request, res: Response) {
    try {
      req.body.tuser.var_password = '';
      req.body.user_id = req.body.tuser.user_id;
      req.body.var_email = req.body.tuser.var_email;
      req.body.var_name = req.body.tuser.var_name;
      req.body.var_default_no = req.body.tuser.var_default_no;
      req.body.var_image = req.body.tuser.var_image;
      delete req.body.tuser;
      delete req.body.trole;
        await Product.findOneAndUpdate(
          { int_glcode: req.body.fk_product },
          {
            $push: { reviews: req.body },
          },
        );
        res.status(200).send({  message: 'Review added successfully.' });
      
    } catch (e) {
      
      res.status(500).send({  message: 'Unexpected error' });
    }
  }
  async getAllOrders(req: Request, res: Response) {
    
    try {
      Order.aggregate([
        { $match: { fk_user: req.body.tuser.user_id } },
        {
          $project: {
            int_glcode: '$int_glcode',
            chr_status: '$chr_status',
            var_payable_amount: '$var_payable_amount',
            fk_product_arr: '$fk_product_arr',
            order_id: '$order_id',
            dt_createddate: '$dt_createddate',
            totalProducts: { $size: '$fk_product_arr' },
            chr_status_text: '',
          },
        },
      ])
        .then(async (order: any) => {
          
          order.reverse();
          
          for(let k = 0; k<order.length;k++){
            if (order[k].chr_status === 'A') {
              order[k].chr_status_text = 'Received';
            } else if (order[k].chr_status === 'C') {
              order[k].chr_status_text = 'Cancelled';
            } else if (order[k].chr_status === 'D') {
              order[k].chr_status_text = 'Delivered';
            } else if (order[k].chr_status === 'P') {
              order[k].chr_status_text = 'Processed';
            } else if (order[k].chr_status === 'S') {
              order[k].chr_status_text = 'Shipped';
            } else if (order[k].chr_status === 'R') {
              order[k].chr_status_text = 'Returned';
            }

            for (let i = 0; i < order[k].fk_product_arr.length; i++) {
              const product = order[k].fk_product_arr[i];
              
              product.cartItem =  0;
              
              product.var_price = product.variants.price;
              product.selling_price = product.variants.selling_price;
              product.start_date = '0000-00-00';
              product.end_date = '0000-00-00';
              if (req.body.tuser && product.wishList) {
                product.like = product.wishList.find((data: any) => data === req.body.tuser.user_id) !== undefined ? 'Y' : 'N';
              } else {
                product.like = 'N';
              }
              product.totalRatting = 0;
              product.ratting = 0;
              product.var_stock = product.variants.stock;
              product.variant_id = product.variants.int_glCode;
              product.is_variant = 'Y';
      
              product.Variant_details = {
                int_glcode: product.variants.int_glCode,
                fk_product: product.int_glcode,
                variant_id: product.variants.int_glcode,
                var_stock: product.variants.stock,
                var_price: product.variants.price,
                selling_price: product.variants.selling_price,
                start_date: '0000-00-00',
                end_date: '0000-00-00',
              };
              delete product.fk_tags;
              delete product.variants;
              delete product.wishList;
              delete product.reviews;
              if (product.txt_nutrition) {
                /* empty */
              } else {
                product.txt_nutrition = '';
              }
            }
          }
    
          res.status(200).send({  message: 'Success', data: order });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(400).send({  message: 'Order not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({  message: 'Unexpected error' });
    }
  }
  async getOrderById(req: Request, res: Response) {
    try {
      
      Order.aggregate([{$match:{ int_glcode: req.params.id }},{
        $lookup: {
          from: 'returnOrder',
          as: 'returnOrder',
          let: { order_inglcode: '$int_glcode' },
          pipeline: [{ $match: { $expr: { $eq: ['$order_inglcode', '$$order_inglcode'] } } }],
        },
      }, ])
        .then((order: any) => {
          order[0].fk_product_arr.map((data:any)=>{
            data.wishList = [];
            data.reviews = [];
            data.var_image = data.variants.image[0];
          })
          
          if(order[0].returnOrder.length>0){
            order[0].returnProduct = [];
            
            order[0].returnOrder.forEach((returnOrder:any) => {

              
              let attribut:any = [];
              
              returnOrder.fk_product_arr.variants.attributes.forEach((data:any)=>{
                attribut.push({
                  "fk_attribute": data.int_glcode,
                  "fk_value":data.value.int_glcode,
                  "var_attribute": data.var_title,
                  "var_attributes_values": data.value.var_title
                })
              })
              
              order[0].returnProduct.push({
                  "fk_product": returnOrder.fk_product_arr.int_glcode,
                    "fk_variant": returnOrder.fk_product_arr.variants.int_glCode,
                    "var_name": returnOrder.fk_product_arr.var_title,
                    "var_price": returnOrder.fk_product_arr.variants.price,
                    "var_discount":  ((parseFloat(returnOrder.fk_product_arr.variants.price)- parseFloat(returnOrder.fk_product_arr.variants.selling_price)) * returnOrder.fk_product_arr.var_unit).toFixed(2),
                    "gst_percentage": returnOrder.fk_product_arr.var_gst,
                    "cancel_status": returnOrder.cancel_status,
                    "gst_price": returnOrder.var_tax,
                    "paid_status": returnOrder.paid_status,
                    "net_price": returnOrder.var_total_amount,
                    "var_unit": returnOrder.fk_product_arr.var_unit,
                    "sub_total":  returnOrder.var_payable_amount,
                    "var_image": returnOrder.fk_product_arr.variants.image[0],
                    "variants": returnOrder.fk_product_arr.variants
              })
            });
          order[0].returnOrder = undefined;
        }
          if (order[0].chr_status === 'A') {
            order[0].chr_status_text = 'Received';
          } else if (order[0].chr_status === 'C') {
            order[0].chr_status_text = 'Cancelled';
          } else if (order[0].chr_status === 'D') {
            order[0].chr_status_text = 'Delivered';
          } else if (order[0].chr_status === 'S') {
            order[0].chr_status_text = 'Shipped';
          } else if (order[0].chr_status === 'P') {
            order[0].chr_status_text = 'Processed';
          } else if (order[0].chr_status === 'R') {
            order[0].chr_status_text = 'Returned';
          }
          res.status(200).send({  message: 'Sucess', data: order[0] });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(400).send({  message: 'Order not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
