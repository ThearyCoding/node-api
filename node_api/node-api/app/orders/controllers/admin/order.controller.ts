/* eslint-disable indent */
import { Request, Response } from 'express';
import Cart from '../../../carts/models/cart.model';
import Promocode from '../../../promocode/models/promocode.model';
import DeliveryCharge from '../../../deliverycharge/models/deliverycharge.model';
import { ObjectId } from 'mongodb';
import moment from 'moment';
const fs = require('fs');
const pdf = require('html-pdf');
import Order from '../../models/order.models';
import Address from '../../../address/models/address.model';
import crypto from 'crypto';

import { dateFormate } from '../../../commons/constants';
import Invoice from '../../models/invoice.models';
import OrderComment from '../../models/comment.models';
import ReturnOrder from '../../models/returnorder.model';
import CompanyDetails from '../../../settings/company-details/models/companydetail.model';
import { logger } from '../../../commons/logger.middleware';
import { NodeLocalCache } from '../../../commons/node.cache';

export class OrderController {
  constructor() {}
  async createOrder(req: Request, res: Response) {
    const products: Array<any> = [];
    let totalAmount = 0;
    let taxAmount = 0;
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
      if (cart.product[0] !== undefined) {
        cart.product = cart.product[0];
        const variant = cart.product.variants.find((data: any) => data.int_glCode === cart.fk_verient);
        const price = parseInt(variant.selling_price);
        let pTax = 0;
        if (parseInt(cart.product.var_gst) > 0) {
          pTax = (parseInt(cart.product.var_gst) / 100) * (price * parseInt(cart.var_unit));
          cart.product.tax_amount = ((parseInt(cart.product.var_gst) / 100) * (price * parseInt(cart.var_unit))).toFixed(2);
          taxAmount += pTax;
        } else {
          cart.product.tax_amount = '0';
        }
        cart.product.variants = variant;
        cart.product.var_unit = cart.var_unit;
        cart.product.total_amount = (price * parseInt(cart.var_unit) + pTax).toFixed(2);
        products.push(cart.product);
        totalAmount += price * parseInt(cart.var_unit);
      }
    });
    if (products.length > 0) {
      let discountAmount: any = 0;
      if (req.body.var_promocode) {
        const promocode: any = await Promocode.findOne({ var_promocode: req.body.var_promocode });
        if (parseInt(promocode.min_order) <= totalAmount) {
          discountAmount = ((promocode.var_percentage / 100) * totalAmount).toFixed(2);
          if (discountAmount > promocode.max_discount_price) {
            discountAmount = promocode.max_discount_price;
          }
        }
      }
      const userAddress: any = await Address.findOne({ int_glcode: req.body.var_user_address });
      req.body.var_user_address = userAddress;
      const deliveryCharge: any = await DeliveryCharge.find();
      deliveryAmount = parseInt(deliveryCharge[0].var_charges);
      const payableAmount = totalAmount + deliveryAmount + taxAmount - discountAmount;

      const cId = new ObjectId();
      const cDate = moment().format(dateFormate);
      const orderID = '#ORD' + crypto.randomInt(100000000, 900000000).toString();
      const order = new Order({
        _id: cId,
        int_glcode: cId.toString(),
        dt_createddate: cDate,
        order_id: orderID,
        is_active: true,
        var_user_address: req.body.var_user_address,
        var_address_type: userAddress.chr_type,
        fk_user: req.body.tuser.user_id,
        fk_product_arr: products,
        register_contact: req.body.tuser.var_mobile_no,
        var_delivery_charge: deliveryAmount.toFixed(2),
        var_wallet_amount: 0,
        var_promocode: req.body.var_promocode ? req.body.var_promocode : '',
        var_discount_amount: discountAmount.toFixed(2),
        var_tax: taxAmount.toFixed(2),
        var_total_amount: totalAmount.toFixed(2),
        var_payable_amount: payableAmount.toFixed(2),
        var_payment_mode: req.body.var_payment_mode,
        var_cashback: 0,
        chr_status: 'A',
        ...req.body,
      });

      try {
        order
          .save()
          .then(async () => {
           
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
            const cache = NodeLocalCache.getCache();
            cache.flushAll();
            cache.getStats();
            Cart.deleteMany({ fk_user: req.body.tuser.user_id }).then((ress) => console.log(ress));
            res.status(200).send({ message: 'Order created' });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(500).send({ message: e });
          });
      } catch (e) {
        logger.error('', e);
        res.status(500).send({ message: 'Unexpected error' });
      }
    } else {
      res.status(404).send({ message: 'Your cart is empty' });
    }
  }

  async updateOrderById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const order = {
      updated_date: cDate,
      chr_status: req.body.chr_status,
    };
    try {
      Order.findOneAndUpdate({ int_glcode: req.body.order_id }, order, {
        new: true,
        upsert: true,
      })
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Order updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }

  async addComment(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const order = {
      updated_date: cDate,
      chr_status: req.body.status,
    };
    try {
      Order.findOneAndUpdate({ order_id: req.body.order_id }, order, {
        new: true,
        upsert: true,
      })
        .then(() => {
          const cId = new ObjectId();
          const comment = new OrderComment({
            _id: cId,
            dt_createddate: cDate,
            int_glcode: cId,
            order_id: req.body.order_id,
            message: req.body.message,
            status: req.body.status,
          });
          try {
            comment.save().then(async () => {});
          } catch (e) {
            /* empty */
            logger.error('', e);
          }
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Comment created' });
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
  async updateReturnOrder(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const order = {
      refund_date: cDate,
      paid_status: 'Y',
      ...req.body
    };
    try {
      ReturnOrder.findOneAndUpdate({ int_glcode: req.params.id }, {$set:order}, {
        new: true,
        upsert: true,
      })
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Amount Refunded' });
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
  async getAllOrders(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
 
    const filter: any[] = [];
    
    if (req.body.search) {
      filter.push({$or:[{ order_id: { $regex: req.body.search, $options: 'i' }},{ 'user.var_name': { $regex: req.body.search, $options: 'i' } }, { 'user.var_mobile_no': { $regex: req.body.search, $options: 'i' } }]});
    } 
  
    if(req.body.toDate && req.body.fromDate){
   
      filter.push(
          {
            create_date: {
              $gte: new Date(req.body.fromDate),
              $lte: new Date(req.body.toDate),
            },
          },
      )
    }
    
    
    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
  
      page = (req.body.page - 1) * req.body.limit;
    }
    if (req.body.sort) {
      sort = req.body.sort;
     
    }
   
    try {
     
          Order.aggregate([
          
            
            {
              $lookup: {
                from: 'users',
                as: 'user',

                let: { user_id: '$fk_user' },
                pipeline: [{ $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } }],
              },
            },
            {
              
              $match: filter.length > 0?{$and:filter}:{}
            },
            { $sort: sort },
            { $limit: limit + page },
            { $skip: page },
          ])
            .then((order: any) => {
              
              order.forEach((ord: any) => {
                ord.user = ord.user[0];
              });
              Order.aggregate([
                {
                  $lookup: {
                    from: 'users',
                    as: 'user',
    
                    let: { user_id: '$fk_user' },
                    pipeline: [{ $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } }],
                  },
                },
                {
                  
                  $match: filter.length > 0?{$and:filter}:{}
                },
                
              ]).then((count: any) => {
               
                res.status(200).send({ data: order, total: count.length });
              });
            })
            .catch((e) => {
              console.log(e)
              res.status(404).send({ message: 'Order not found' });
            });
        
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }

  async getDashboardOrders(req: Request, res: Response) {
   
    let catcheKey = '_orders';
    
    if(req.body.fromDate){
      catcheKey += req.body.fromDate;
    }
    if(req.body.toDate){
      catcheKey += req.body.toDate;
    }
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get(catcheKey ) ==undefined){
        Order.aggregate([
          {
            $match: {
              $and: [
                {
                  create_date: {
                    $gte: new Date(req.body.fromDate),
                    $lte: new Date(req.body.toDate),
                  },
                },
              ],
            },
          }
        ])
        .then(async (resporder: any) => {
          const chartOrd: any[] = [];
          const orders =resporder.reduce(function(rv:any, x:any) {
            (rv[moment(x['create_date']).format('MMM')] = rv[moment(x['create_date']).format('MMM')] || []).push(x);
            return rv;
          }, {});
          const chartLabel = [...Object.keys(orders)];
          const ordersForChart: number[] = [];
          let totalSale = 0;
          let totalEarning = 0;
          const chartForProducts : number[] = [];
          Object.keys(orders).forEach((data:any)=>{
            let total = 0;
            let productCount = 0;
            orders[data].forEach((value:any)=>{
              chartOrd.push({date:Date.parse(value.create_date) ,amount:parseInt(value.var_payable_amount)});
              total+= parseInt(value.var_payable_amount)
              productCount+= value.fk_product_arr.length; 
              
            })
           
            totalSale += productCount;
            totalEarning += total;
            ordersForChart.push(total);
            chartForProducts.push(productCount);
           });
          const chartOrdsMap =chartOrd.reduce(function(rv:any, x:any) {
            
            (rv[x["date"]] = rv[x["date"]] || []).push(x);
            
            return rv;
          }, {});
          const chartOrdsMapList:any = [];
          Object.keys(chartOrdsMap).forEach((data:any)=>{
            let total = 0;
           
            chartOrdsMap[data].forEach((value:any)=>{
              total+= value.amount;
             
            })
           
            chartOrdsMapList.push([parseInt(data),total]);
            
           });
           
           const todayOrders = await Order.aggregate([
            {
              $match: {
                  create_date:new Date(moment().format('YYYY-MM-DD'))},
            },
            {
              $lookup: {
                from: 'users',
                as: 'user',
                let: { user_id: '$fk_user' },
                pipeline: [{ $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } }],
              },
            },
            {$sort:{_id: -1}},
            { $limit: 5 },
            { $skip: 1 },
          ])
          const allOrders = await Order.find()
          const statuses : any = {}

          const allOrdersForChart =allOrders.reduce(function(rv:any, x:any) {
           
            (rv[x["chr_status"]] = rv[x["chr_status"]] || []).push(x);
            return rv;
          }, {});
        
         
            
              statuses['Received']= allOrdersForChart['A']?allOrdersForChart['A'].length:0;
              statuses['Cancelled']= allOrdersForChart['C']?allOrdersForChart['C'].length:0;
              statuses['Delivered']= allOrdersForChart['D']?allOrdersForChart['D'].length:0;
              statuses['Processed']= allOrdersForChart['P']?allOrdersForChart['P'].length:0;
              statuses['Shipped']= allOrdersForChart['S']?allOrdersForChart['S'].length:0;
              statuses['Returned']= allOrdersForChart['R']?allOrdersForChart['R'].length:0;
            
           
         const lastMonthEarning = await  Order.aggregate([
          {
            $match: {
                create_date:new Date(moment().subtract(1, 'months').format('YYYY-MM-DD')),
          },
          },
            {
              $group: {
                _id:"",
                lastMonthEarning: { $sum: { $toDouble: "$var_payable_amount" } },
              }
            }
          ]);
          const lifetimeEarning = await  Order.aggregate([
              {
                $group: {
                  _id:"",
                  lifetimeEarning: { $sum: { $toDouble: "$var_payable_amount" } },
                }
              }
            ]);
            cache.set(catcheKey,{  todayOrders: todayOrders,
              chartLabel:chartLabel.reverse(), 
              ordersForChart: ordersForChart.reverse(),
              chartForProducts: chartForProducts,
              totalSale:totalSale,
              totalEarning: totalEarning,
              statusCount: statuses,
              statusLabel: [],
              chartOrd:chartOrdsMapList,
              lastMonthEarning: lastMonthEarning.length?lastMonthEarning[0].lastMonthEarning:0,
              lifetimeEarning: lifetimeEarning.length?lifetimeEarning[0].lifetimeEarning:0})

          res.status(200).send({ 
            todayOrders: todayOrders,
            chartLabel:chartLabel.reverse(), 
            ordersForChart: ordersForChart.reverse(),
            chartForProducts: chartForProducts,
            totalSale:totalSale,
            totalEarning: totalEarning,
            statusCount: statuses,
            statusLabel: [],
            chartOrd:chartOrdsMapList,
            lastMonthEarning: lastMonthEarning.length?lastMonthEarning[0].lastMonthEarning:0,
            lifetimeEarning: lifetimeEarning.length?lifetimeEarning[0].lifetimeEarning:0
            });
         
        })
        .catch((e) => {
          res.status(404).send({ message: 'Order not found' });
        });
      }else{
        res.status(200).send(cache.get(catcheKey ));
     } 
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getOrderById(req: Request, res: Response) {
    
      Order.aggregate([
        { $match: { int_glcode: req.params.id } },
        {
          $lookup: {
            from: 'users',
            as: 'user',
            let: { user_id: '$fk_user' },
            pipeline: [{ $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } }],
          },
        },
        {
          $lookup: {
            from: 'invoices',
            as: 'invoices',
            let: { order_id: '$order_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$order_id', '$$order_id'] } } }],
          },
        },
        {
          $lookup: {
            from: 'returnOrder',
            as: 'returnOrder',
            let: { order_inglcode: '$int_glcode' },
            pipeline: [{ $match: { $expr: { $eq: ['$order_inglcode', '$$order_inglcode'] } } }],
          },
        },
        {
          $lookup: {
            from: 'comments',
            as: 'comments',
            let: { order_id: '$order_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$order_id', '$$order_id'] } } }],
          },
        },
      ])
        .then((order: any) => {
          if (order.length > 0) {
            order[0].user = order[0].user[0];
           
            res.status(200).send({ data: order[0] });
          } else {
            res.status(404).send({ message: 'Order not found' });
          }
        })
        .catch(() => {
          res.status(404).send({ message: 'Order not found' });
        });
      
  
  }
 
  async getInvoicePdf(req: Request, res: Response) {
    try {
      const orders:any  = await Order.aggregate([
        { $match: { int_glcode: req.params.id } },
        {
          $lookup: {
            from: 'users',
            as: 'user',
            let: { user_id: '$fk_user' },
            pipeline: [{ $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } }],
          },
        },
        {
          $lookup: {
            from: 'invoices',
            as: 'invoices',
            let: { order_id: '$order_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$order_id', '$$order_id'] } } }],
          },
        }
      ]);
    
      const companydetail = await CompanyDetails.find();
      let product:any="";
     const order = orders[0];

      order.fk_product_arr.forEach((data:any)=>{
        let attribute="";
        console.log("product", data)
        data.variants.attributes.forEach((data:any)=>{
          
          attribute+=`${data.var_title}:${data.value.var_title}, `
        })
        product+= ` 
            <tr style="margin-top:'10px';border-bottom: 'thin solid'" >
                <td style="text-align:'left'"><p style="font-size:12px; margin:0px">${data.var_title}<p style="font-size:10px; margin:5px 0px">${attribute}</p> </td>
                <td style="text-align:'center'">₹${data.variants.price}</td>
                <td style="text-align:'center'">₹${parseFloat(data.variants.price) - parseFloat(data.variants.selling_price)}</td>
             
                <td style="text-align:'center'">₹${data.tax_amount}</td>
                <td style="text-align:'center'">${data.var_quantity}</td>
                <td style="text-align:'center'">₹${data.total_amount}</td>
            </tr>
            `;
      })
      
      const finalHtml = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>A simple, clean, and responsive HTML invoice template</title>
      
          <style>
            /*
        Common invoice styles. These styles will work in a browser or using the HTML
        to PDF anvil endpoint.
      */
      
      
      
      table {
        width: 100%;
        border-collapse: collapse;
      }
      
      table tr td {
        padding: 0;
      }
      
      table tr td:last-child {
        text-align: right;
      }
      
      .bold {
        font-weight: bold;
      }
      
      .right {
        text-align: right;
      }
      
      .large {
        font-size: 1.75em;
      }
      
      .total {
        font-weight: bold;
        color: #fb7578;
      }
      
      .logo-container {
        margin: 20px 0 70px 0;
      }
      table{
        margin:0 !important;
      }
      .invoice-info-container {
        font-size: 0.875em;
      }
      .invoice-info-container td:first-child {
        padding: 4px 0;
        width:40%;
      }
      
      .invoice-info-container td:last-child {
        padding: 4px 0;
        width:60%;
      }
      
      .client-name {
        font-size: 1.2em;
        vertical-align: top;
      }
      
      .line-items-container {
        margin: 70px 0;
        font-size: 0.875em;
      }
      
      .line-items-container th {
        text-align: left;
        color: #000;
        border-bottom: 1px solid #ddd;
        padding: 10px 10px 10px 10px;
        background:#ededeb;
        font-size: 12px !important;
      }
      .line-items-container th:last-child{
  
        text-align: right;
      }
      .line-items-container td {
        text-align: left;
        color: #000;
        border-bottom: 1px solid #ddd;
        padding: 10px 10px 10px 10px;
        font-size: 0.75em;
        
      }
    
      
      .line-items-container, .line-items-container.tr {
        border: 1px solid #ddd;
        border-collapse: collapse;
      }   
      .line-items-container-total td {
        
        color: #000;
        border-bottom: 1px solid #e3e3e3;
        padding: 10px 10px 10px 10px;
        font-size: 0.75em;
        
      }

      .line-items-container-total td:first-child{
        text-align: right;
        width:60%;
      }
      .line-items-container-total td:nth-child(2){
        text-align: left;
        width:30%;
      }
      
      .line-items-container-total, line-items-container-total.tr {
        border: 1px solid #e3e3e3;
        border-collapse: collapse;
      }   
      .payment-info {
        
        line-height: 1.5;
        
       
        padding: 10px 0 15px 0;
        
       
      }
      
      
      .footer{
        margin-top:40px;
      }
      .footer td{
        text-align: left;
      }
      .footer td:first-child{
        width:40%
      }
      .footer td:last-child{
        width:60%
        text-align: left;
      }
      
      .footer-info span:last-child {
        padding-right: 0;
      }
      
      .page-container {
        display: none;
      }
        .invoice-table{
          
        }
        .invoice-table td:first-child{
         
          width: 40%;
        }
        .invoice-table td:last-child{
         
          width: 60%;
        }
       
        }
          </style>
       
        </head>
      
        <body>
        
              <div class="page-container">
                  Page
                  <span class="page"></span>
                  of
                  <span class="pages"></span>
                </div>
                <table class="invoice-table"  >
                <tr>
                <td align="left">
               
                  <img
                    style="height: 18px; float:left;"
                    src="http://your_url/images/logo.png"
                  >
                
                
                </td >
                <td  class="client-name">
                <ul style=" text-align: left; float: left;list-style-type:none">
                <li style="margin-bottom:10px ;font-size:18px; font-weight:bold; color:#f67301">INVOICE</li>
                  <li style="font-size:12px; ">
                    Invoice Number: ${order.invoices[0].invoice_id}
                  </li>
                  <li style="font-size:12px; margin-top:5px">
                  Invoice Date: ${order.invoices[0].dt_createddate}
                  </li>
                </ul>
                </td>
                </tr>
                </table>
                <div style="margin-top:20px"><div/>
                <table class="invoice-info-container"  >
                  <tr>
                    <td   style="color:#f67301; font-weight:bold; font-size:14px">
                      Invoice To
                    </td>
                    <td style="color:#f67301; font-weight:bold; font-size:14px" >
                    <ul style=" margin:0;text-align: left; float: left;list-style-type:none">
                      <li >
                      Invoice From
                      </li>
                    </ul> 
                    </td>
                  </tr>
                  
                  <tr>
                  <td>
                 <strong style=" font-size:14px; text-transform: uppercase;">${order.user[0].var_name}</strong>
                 
                  </td>
                    <td>
                    <ul style="margin:0; text-align: left; float: left;list-style-type:none">
                      <li >
                    <strong style=" font-size:14px; text-transform: uppercase;">${companydetail[0].companyName}</strong>
                      </li>
                      </ul>
                    </td>
                  </tr>
                 
                  <tr>
                    <td style=" font-size:12px;">
                    <div style="margin-top:5px"><div/>
                     ${order.user[0].var_email}
                    </td>
                    <td style=" font-size:12px;">
                    <div style="margin-top:5px"><div/>
                    <ul style="margin:0; text-align: left; float: left;list-style-type:none">
                    <li >
                 
                    ${companydetail[0].gst} 
                    </li>
                    </ul>
                    </td>
                  </tr>
                  <tr>
                    <td style=" font-size:12px;">
                    ${order.var_user_address.var_house_no},  ${order.var_user_address.var_app_name}, ${order.var_user_address.var_landmark},

                    </td>
                    <td style=" font-size:12px;">
                    <ul style="margin:0; text-align: left; float: left;list-style-type:none">
                    <li >
                    ${companydetail[0].email} 
                  
                     </li>
                     </ul>
                    </td>
                  </tr>
                  <tr>
                    <td style=" font-size:12px;">

                    ${order.var_user_address.var_state}, ${order.var_user_address.var_country}, ${order.var_user_address.var_pincode}
                    </td>
                    <td style=" font-size:12px;">
                    <ul style="margin:0; text-align: left; float: left;list-style-type:none">
                    <li >
                  
                     ${companydetail[0].address} 
                     </li>
                     </ul>
                    </td>
                  </tr>
                 
                </table>
                
                <div style="margin-top:20px"><div/>
                <table class="line-items-container" >
                  <thead>
                  <tr>
                  <th style="text-align:'left'">Product</th>
                  <th style="text-align:'left'">Price</th>
                  <th style="text-align:'left'">Discount</th>
                  <th style="text-align:'left'">Tax</th>
                  <th style="text-align:'left'">Quantity</th>
                  <th style="text-align:'left'" >Total</th>
                  </tr>
                  </thead>
                  <tbody>
                    ${product}
                  </tbody>
                </table>
                
                
                <table class="line-items-container-total">
                  
                  <tbody class="payment-info">
                      <tr style=""border-bottom": 'thin solid'}}>
                          <td></td>
                      
                          <td style=style="text-align:'left'">Total</td>
                          <td style=style="text-align:'left'"><div>₹${order.var_total_amount}</div></td>
                        
                      </tr>
                      <tr>
                      <td></td>
                     
                          <td style=style="text-align:'left'">Discount</td>
                          <td style=style="text-align:'left'"><div >₹${order.var_discount_amount}</div></td>
                          
                      </tr>
                      <tr>
                      <td></td>
                     
                          <td style=style="text-align:'left'">Coupon Discount</td>
                          <td style=style="text-align:'left'"><div >₹${order.var_promo_discount?order.var_promo_discount:0}</div></td>
                        
                      </tr>
                      <tr>
                      <td></td>
                          <td style=style="text-align:'left'">Tax</td>
                          <td style=style="text-align:'left'"><div >₹${order.var_tax}</div></td>
                          
                      </tr>
                      <tr>
                      
                      <td></td>
                          <td style=style="text-align:'left'">Delivery Charges</td>
                          <td style=style="text-align:'left'"><div >₹${order.var_delivery_charge}</div></td>
                        
                      </tr>
                      <tr>
                      <td></td>
                      
                          <td style="text-align:'left'; font-weight:600;font-size:12px;">Grand Total</td>
                          <td style="text-align:right; "><div style="font-weight:600;font-size:12px">₹${order.var_payable_amount}</div></td>
                          
                      </tr>
                  </tbody>
                 
                </table>
                <div style="margin-top:40px"><div/>
                <table class="footer">
                  <tr>
                    <td >
                    
                    <span style="color:#f67301; font-weight:600, font-size:12px" >Payment Method</span>
                    </td>
                    <td >
                    <ul style="margin:0; text-align: left; float: left;list-style-type:none">
                    <li >
                    <span style="color:#f67301; font-weight:600, font-size:12px;text-align: left;" >Terms and Condition</span>
                      </li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                  <td >
                  <span style=" font-size:12px" >${order.var_payment_mode==='C'?"Cash":"Online"}</span>
                    
                  </td>
                  <td >
                  <ul style="margin:0; text-align: left; float: left;list-style-type:none">
                  <li >
                      <span style="font-size:12px;text-align: left;" >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy has</span>
                      </li>
                      </ul>
                  </td>
                </tr>
                </table>
        </body>
      </html>`
      // Options for PDF generation
      const options = {
        format: 'A4',
        border: {
          top: '0.5in', // default is 0, units: mm, cm, in, px
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        childProcessOptions: {
          env: {
            OPENSSL_CONF: '/dev/null',
          },
        }
      };
  
      // Generate PDF
      pdf.create(finalHtml, options).toBuffer((err: any, buffer: any) => {
        if (err) {
          console.error('Error while creating invoice:', err);
          res.status(500).send('Error while creating invoice');
        } else {
          // Set response headers
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=${order.invoices[0].invoice_id}.pdf`);
  
          // Send PDF as response
          res.send(buffer);
        }
      });
    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}
