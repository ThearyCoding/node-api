/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Product from '../../models/product.model';
import { dateFormate } from '../../../commons/constants';
import { NodeLocalCache } from '../../../commons/node.cache';
import { logger } from '../../../commons/logger.middleware';
import Category from '../../../categories/parent/models/category.model';
import SubCategory from '../../../categories/sub/models/subcategory.model';
import Brand from '../../../brands/models/brand.model';
import Attribute from '../../../attributes/models/attribute.model';
import AttributeValue from '../../../attributes/models/attributevalue.model';
import StockHistory from '../../models/stockupdate.history.models';
const { ObjectId } = require('mongodb');

export class ProductController {
  constructor() {}
  async createProduct(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const variants = [];
    for (let i = 0; i < req.body.variants.length; i++) {
      const vId = new ObjectId();
      req.body.variants[i].attributes.forEach((atr: any) => {
        atr.values = [];
      });
      variants.push({
        int_glCode: vId.toString(),
        attributes: req.body.variants[i].attributes,
        price: req.body.variants[i].price,
        selling_price: req.body.variants[i].selling_price,
        stock: req.body.variants[i].stock,
        image: req.body.variants[i].image,
      });
    }
    req.body.variants = variants;
    const product = new Product({
      _id: cId,
      int_glcode: cId.toString(),
      dt_createddate: cDate,
      dt_modifydate: cDate,
      var_image: req.body.var_image,
      chr_publish: true,
      chr_delete: false,
      var_slug: req.body.var_title.toString().replaceAll(' ', '-'),
      ...req.body,
    });
    try {
      product
        .save()
        .then(async () => {
          NodeLocalCache.getInstance();
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Product created' });
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

  async createProductByBulk(req: Request, res: Response) {
   
    try{
      for(var l=0; l<req.body.datas.length;l++){
        const cId = new ObjectId();
        const cDate = moment().format(dateFormate);

        const product = new Product({
          _id: cId,
          int_glcode: cId.toString(),
          dt_createddate: cDate,
          dt_modifydate: cDate,
          var_image: req.body.datas[l].var_image,
          chr_publish: true,
          chr_delete: false,
          var_slug: req.body.datas[l].var_title.toString().replaceAll(' ', '-'),
          ...req.body.datas[l],
        });
        await product
        .save();
      }
    
      res.status(200).send({ message: 'Product(s) created' });
    }catch(e){
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
    
    try {
      
      NodeLocalCache.getInstance();
      const cache = NodeLocalCache.getCache()
      cache.flushAll();
      cache.getStats();
      res.status(200).send({ message: 'Product(s) updated' });
    } catch (e) {
      logger.error('', e);
     return res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateProductByBulk(req: Request, res: Response) {
  
    const cDate = moment().format(dateFormate);
    
    try{
      for(var l=0; l<req.body.datas.length;l++){
        console.log("daata", req.body.datas[l].id )
        const product = {
          updated_date: cDate,
          ...req.body.datas[l].datas,
        };
    
        try {
          Product.updateOne(
            { _id: req.body.datas[l].id },
            { $set: product },
            {
              new: false,
              overwrite: true,
            },
          ).then(e=>{console.log(e)}).catch(e=>console.log(e))
        }catch(e){
          console.log(e)
        }
      }
    }catch(e){
      logger.error('', e);
      console.log(e)
     return res.status(500).send({ message: 'Unexpected error' });
    }
    
    try {
      
      NodeLocalCache.getInstance();
      const cache = NodeLocalCache.getCache()
      cache.flushAll();
      cache.getStats();
      res.status(200).send({ message: 'Product(s) updated' });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateProductById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const variants = [];
    if (req.body.variants) {
      for (let i = 0; i < req.body.variants.length; i++) {
        const vId = new ObjectId();
        req.body.variants[i].attributes.forEach((atr: any) => {
          atr.values = [];
        });
        
        variants.push({
          int_glCode: vId.toString(),
          attributes: req.body.variants[i].attributes,
          price: req.body.variants[i].price,
          selling_price: req.body.variants[i].selling_price,
          stock: req.body.variants[i].stock,
          image: req.body.variants[i].image,
        });
      }
      req.body.variants = variants;
    }
    const product = {
      updated_date: cDate,
      ...req.body,
    };

    try {
      Product.updateOne(
        { int_glcode: req.params.id },
        { $set: product },
        {
          new: false,
          overwrite: true,
        },
      )
        .then(() => {
          NodeLocalCache.getInstance();
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          
          res.status(200).send({ message: 'Product updated' });
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
  async deleteProductById(req: Request, res: Response) {
    try {
      const ids = req.params.ids.split(',');
      for (let i = 0; i < ids.length; i++) {
        await Product.findOneAndDelete({ _id: ids[i] });
      }
      NodeLocalCache.getInstance();
      const cache = NodeLocalCache.getCache()
      cache.flushAll();
      cache.getStats();
      res.status(200).send({ message: 'Product deleted' });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllProduct(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '_products';
    const filter: any[] = [];
    if (req.body.fk_category) {
      catcheKey += req.body.fk_category;
      filter.push({ fk_category: req.body.fk_category });
    }
    if (req.body.search) {
      filter.push({$or:[ {var_title: { $regex: req.body.search, $options: 'i' }}, {"category.var_title": { $regex: req.body.search, $options: 'i' }}, {"brand.var_title": { $regex: req.body.search, $options: 'i' }} ,{ int_glcode: { $regex: req.body.search, $options: 'i' } }]});
    }
    if (req.body.fk_subcategory) {
      catcheKey += req.body.fk_subcategory;
      filter.push({ fk_subcategory: req.body.fk_subcategory });
    }
    if (req.body.fk_subcategory2) {
      catcheKey += req.body.fk_subcategory2;
      filter.push({ fk_subcategory2: req.body.fk_subcategory2 });
    }
    if (req.body.fk_brand) {
      catcheKey += req.body.fk_brand;
      filter.push({ fk_brand: req.body.fk_brand });
    }
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
        Product.aggregate([
        
          
          {
            $lookup: {
              from: 'categories',
              as: 'category',
              let: { int_glcode: '$fk_category' },
              pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
            },
          },
          {
            $lookup: {
              from: 'brands',
              as: 'brand',
              let: { int_glcode: '$fk_brand' },
              pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
            },
          },
          {
            $match:
              filter.length > 0
                ? {
                    $and: filter,
                  }
                : {},
          },
          { $sort: sort },
          { $limit: limit + page },
          { $skip: page },
        ])

          .then((products: any) => {
            Product.aggregate([
        
          
              {
                $lookup: {
                  from: 'categories',
                  as: 'category',
                  let: { int_glcode: '$fk_category' },
                  pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
                },
              },
              {
                $lookup: {
                  from: 'brands',
                  as: 'brand',
                  let: { int_glcode: '$fk_brand' },
                  pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
                },
              },
              {
                $match:
                  filter.length > 0
                    ? {
                        $and: filter,
                      }
                    : {},
              }
              
            ]).then((count: any) => {
              cache.set(catcheKey,{ data: products, total: count.length })
              res.status(200).send({ data: products, total: count.length });
            });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(404).send({ message: 'Product not found' });
          });
        }else{
          res.status(200).send(cache.get(catcheKey ));
       } 
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getProductById(req: Request, res: Response) {
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get( req.params.id  ) ==undefined){
      Product.findOne({ _id: req.params.id })
        .then((product: any) => {
          Product.findOneAndUpdate(
            { int_glcode: req.params.id },
            { $inc: { view_count: 1 } },
            {
              new: true,
              upsert: true,
            },
          );
          cache.set(req.params.id,{ data: { ...product._doc } })
          res.status(200).send({ data: { ...product._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Product not found' });
        });
      }else{
        res.status(200).send(cache.get( req.params.id  ));
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async  validateBulkData(req: Request, res: Response) {
    var isValid = true;
    var error_message = '';

    try{
      for(var i = 0; i<req.body.data.length;i++){
        if((await Category.countDocuments({int_glcode:req.body.data[i].category_id}))===0){
          isValid = false;
          error_message = `Error found in row ${i+1}, category id is not valid`
          return res.status(404).send({ message: error_message})
        }
        if((await SubCategory.countDocuments({int_glcode:req.body.data[i].subcategory_id}))===0){
          isValid = false;
          error_message = `Error found in row ${i+1}, sub category id is not valid`
          return res.status(404).send({ message: error_message})
        }
        if((await Brand.countDocuments({int_glcode:req.body.data[i].brand_id}))===0){
          isValid = false;
          error_message = `Error found in row ${i+1}, brand id is not valid`
          return res.status(404).send({ message: error_message})
        }
        for(var k = 0; k<req.body.data[i].variants.length;k++){
          for(var l = 0; l<req.body.data[i].variants[k].attribute_ids.length;l++){
            if((await Attribute.countDocuments({int_glcode:req.body.data[i].variants[k].attribute_ids[l]}))===0){
              isValid = false;
              error_message = `Error found in row ${i+1} in variants row ${k+1} in attributes row ${l+1}, atribute id is not valid`
              return res.status(404).send({ message: error_message})
            }
          }
          for(var m = 0; m<req.body.data[i].variants[k].values_ids.length;m++){
            if((await AttributeValue.countDocuments({int_glcode:req.body.data[i].variants[k].values_ids[m]}))===0){
              isValid = false;
              error_message = `Error found in row ${i+1} in variants row ${k+1} in attribute values row ${m+1}, atribute value id is not valid`
              return res.status(404).send({ message: error_message})
            }
          }
        }
      }
      if(isValid){
        const datas = [];
        for(var i = 0; i<req.body.data.length;i++){
        const variatns = [];
         
          for(var k = 0; k<req.body.data[i].variants.length;k++){
            let attributes:any =[];
            for(var l = 0; l<req.body.data[i].variants[k].attribute_ids.length;l++){
                let attribute:any = await Attribute.findOne({int_glcode:req.body.data[i].variants[k].attribute_ids[l]})
                let value = await AttributeValue.findOne({int_glcode:req.body.data[i].variants[k].values_ids[l]})
                attribute.value =value;
                attributes.push({
                  ...attribute._doc,
                  value:value
                })
            }
            const variant = {
              attributes: attributes,
              price: req.body.data[i].variants[k].price,
              selling_price: (parseFloat(req.body.data[i].variants[k].price)-(parseFloat(req.body.data[i].variants[k].price)*(parseFloat(req.body.data[i].discount)/100))).toFixed(2),
              stock: req.body.data[i].variants[k].stocks,
              image: req.body.data[i].variants[k].images,
            }
            variatns.push(variant);
            
          }
          let data={
            fk_category:req.body.data[i].category_id,
            fk_subcategory:req.body.data[i].subcategory_id,
            fk_brand:req.body.data[i].brand_id,
            fk_tags:req.body.data[i].tags,
            var_title:req.body.data[i].title,
            var_image:req.body.data[i].thumb_image,
            var_gst:req.body.data[i].tax,
            var_short_description:req.body.data[i].short_description,
            txt_description:req.body.data[i].long_description,
            var_offer:req.body.data[i].discount,
            txt_nutrition:req.body.data[i].specification,
            sku_id:req.body.data[i].sku_id,
            variants:variatns
          }
          datas.push(data);
        }
       
        
        
        res.status(200).send({ message: 'Data validation success',data:datas})
      
      }
    }catch(e){
      res.status(404).send({ message: 'Errors in your datas'})
    }
  }


  async  validateBulkUpdateData(req: Request, res: Response) {
    var isValid = true;
    var error_message = '';

    try{
      for(var i = 0; i<req.body.data.length;i++){
        if((await Product.countDocuments({int_glcode:req.body.data[i].product_id}))===0){
          isValid = false;
          error_message = `Error found in row ${i+1}, product id is not valid`
          return res.status(404).send({ message: error_message})
        }
        if((await Category.countDocuments({int_glcode:req.body.data[i].category_id}))===0){
          isValid = false;
          error_message = `Error found in row ${i+1}, category id is not valid`
          return res.status(404).send({ message: error_message})
        }
        if((await SubCategory.countDocuments({int_glcode:req.body.data[i].subcategory_id}))===0){
          isValid = false;
          error_message = `Error found in row ${i+1}, sub category id is not valid`
          return res.status(404).send({ message: error_message})
        }
        if((await Brand.countDocuments({int_glcode:req.body.data[i].brand_id}))===0){
          isValid = false;
          error_message = `Error found in row ${i+1}, brand id is not valid`
          return res.status(404).send({ message: error_message})
        }
        for(var k = 0; k<req.body.data[i].variants.length;k++){
          for(var l = 0; l<req.body.data[i].variants[k].attribute_ids.length;l++){
            if((await Attribute.countDocuments({int_glcode:req.body.data[i].variants[k].attribute_ids[l]}))===0){
              isValid = false;
              error_message = `Error found in row ${i+1} in variants row ${k+1} in attributes row ${l+1}, atribute id is not valid`
              return res.status(404).send({ message: error_message})
            }
          }
          for(var m = 0; m<req.body.data[i].variants[k].values_ids.length;m++){
            if((await AttributeValue.countDocuments({int_glcode:req.body.data[i].variants[k].values_ids[m]}))===0){
              isValid = false;
              error_message = `Error found in row ${i+1} in variants row ${k+1} in attribute values row ${m+1}, atribute value id is not valid`
              return res.status(404).send({ message: error_message})
            }
          }
        }
      }
      if(isValid){
        const datas = [];
        const ids = [];
        for(var i = 0; i<req.body.data.length;i++){
        const variatns = [];

          for(var k = 0; k<req.body.data[i].variants.length;k++){
            let attributes:any =[];
            for(var l = 0; l<req.body.data[i].variants[k].attribute_ids.length;l++){
                let attribute:any = await Attribute.findOne({int_glcode:req.body.data[i].variants[k].attribute_ids[l]})
                let value = await AttributeValue.findOne({int_glcode:req.body.data[i].variants[k].values_ids[l]})
                attribute.value =value;
                attributes.push({
                  ...attribute._doc,
                  value:value
                })
            }
            const variant = {
              attributes: attributes,
              price: req.body.data[i].variants[k].price,
              selling_price: (parseFloat(req.body.data[i].variants[k].price)-(parseFloat(req.body.data[i].variants[k].price)*(parseFloat(req.body.data[i].discount)/100))).toFixed(2),
              stock: req.body.data[i].variants[k].stock,
              image: req.body.data[i].variants[k].images,
            }
            variatns.push(variant);
          }
          let id =  req.body.data[i].product_id;
          let data={
            fk_category:req.body.data[i].category_id,
            fk_subcategory:req.body.data[i].subcategory_id,
            fk_brand:req.body.data[i].brand_id,
            fk_tags:req.body.data[i].tags,
            var_title:req.body.data[i].title,
            var_image:req.body.data[i].thumb_image,
            var_gst:req.body.data[i].tax,
            var_short_description:req.body.data[i].short_description,
            txt_description:req.body.data[i].long_description,
            var_offer:req.body.data[i].discount,
            txt_nutrition:req.body.data[i].specification,
            sku_id:req.body.data[i].sku_id,
            variants:variatns
          
          }
          datas.push(data);
          ids.push(id);
        }
       
       
        res.status(200).send({ message: 'Data validation success',data:datas,ids:ids})
      
      }
    }catch(e){
      res.status(404).send({ message: 'Errors in your datas'})
    }
  }
  async getProductByVariant(req: Request, res: Response){
    let limit = 10;
    let page = 0;
    const filter: any[] = [];
    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
    }
    if (req.body.search) {
      filter.push({$or:[ {var_title: { $regex: req.body.search, $options: 'i' }}]});
    }
    Product.aggregate([
      {
        $unwind:'$variants'
      },
      {
        $match:
          filter.length > 0
            ? {
                $and: filter,
              }
            : {},
      },
      { $limit: limit + page },
      { $skip: page },

    ])
      .then(async (products: any) => {
        Product.aggregate([{
          $unwind:'$variants'
        },
        {
          $match:
            filter.length > 0
              ? {
                  $and: filter,
                }
              : {},
        },]).then((count)=>{
          res.status(200).send({ status: 1, message: 'Success', data: products, total: count.length });

        })
      },(err)=>console.log(err))
   }
   async updateStock(req: Request, res: Response){
   
    Product.updateOne(
      { _id: req.params.id, "variants.int_glCode": req.body.variantId },
      { $set: { "variants.$.stock" : req.body.stock} }
    )
      .then(async (products: any) => {
        const cId = new ObjectId();
        const cDate = moment().format(dateFormate);
         const history = new StockHistory({
          _id: cId,
          int_glcode: cId.toString(),
          update_date:cDate,
          email:req.body.tuser.var_email,
          variant_id:req.body.variantId,
          product_id:req.params.id,
          quantity:req.body.stock,
          user_id:req.body.tuser.user_id,
          name:req.body.tuser.var_name
         });
         history.save();
         
          res.status(200).send({ status: 1, message: 'Stock updated' });

        
      },(err)=>console.log(err))
   }
   async getStockUpdateHistory(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    
    if (req.body.sort) {
      sort = req.body.sort;
     
    }
    
    try {
    
        StockHistory.aggregate([
          {
            $match:{ variant_id: req.params.id}
          },
          { $sort: sort },
          { $limit: limit + page },
          { $skip: page },
        ])

          .then((products: any) => {
            StockHistory.countDocuments({ variant_id: req.params.id}
            ).then((count: any) => {
              res.status(200).send({ data: products, total: count });
            },(err)=>console.log(err));
          })
          .catch((e) => {
            logger.error('', e);
            res.status(404).send({ message: 'History not found' });
          });
       
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
