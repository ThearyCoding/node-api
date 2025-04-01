import { Request, Response } from 'express';
import Product from '../../models/product.model';
import Cart from '../../../carts/models/cart.model';
import Brand from '../../../brands/models/brand.model';
import Category from '../../../categories/parent/models/category.model';
import SubCategory from '../../../categories/sub/models/subcategory.model';
import { logger } from '../../../commons/logger.middleware';
import General from '../../../settings/general/models/general.model';
import { NodeLocalCache } from '../../../commons/node.cache';

export class ProductController {
  constructor() {}
  async getAllProduct(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let catcheKey = '_fproducts';
    let sort:{} = {date: -1};
    const filter: any[] = [{chr_publish:true}];

    if (req.body.fk_category && req.body.fk_category!=="all") {
      filter.push({ fk_category: req.body.fk_category });
      catcheKey += req.body.fk_category;
    }
    
  
    if (req.body.tag&&req.body.tag.length>0) {
      const tags:any = []
      req.body.tag.forEach((d:string)=>{
        tags.push({ fk_tags: {$in:[d]} })
        catcheKey +=  d;
      })
      filter.push({$or:tags});
    }

    if (req.body.atribute ) {
      const attributes:any = []
      
      Object.values(req.body.atribute).forEach((data)=>{
        attributes.push({ "variants.attributes.value.int_glcode": data  });
        catcheKey += data;
      })
      if(attributes.length >0){
        filter.push({ $or:attributes });
      }
     
    }
  
    if (req.body.search) {
      filter.push({$or:[ {var_title: { $regex: req.body.search, $options: 'i' }}, {"category.var_title": { $regex: req.body.search, $options: 'i' }}, {"brand.var_title": { $regex: req.body.search, $options: 'i' }} ]});
    }
   
    if (req.body.fk_subcategory&&req.body.fk_subcategory.length>0) {
      const subCats:any = []
      req.body.fk_subcategory.forEach((d:string)=>{
        subCats.push({ fk_subcategory: d })
        catcheKey +=  d;
      })
      filter.push({$or:subCats});
    }
    if (req.body.fk_subcategory2) {
      filter.push({ fk_subcategory2: req.body.fk_subcategory2 });
      catcheKey +=  req.body.fk_subcategory2;
    }
    if (req.body.fk_brand && req.body.fk_brand.length>0) {
      const brands:any = []
      req.body.fk_brand.forEach((d:string)=>{
        brands.push({ fk_brand: d })
        catcheKey +=  d;
      })
      filter.push({$or:brands});
    }
    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
      catcheKey +=  req.body.limit;
      catcheKey +=  page;
    }
    if (req.body.sort) {
      sort = req.body.sort;
      catcheKey +=  req.body.sort;
    }
    if (req.body.from_price && req.body.to_price) {
      catcheKey +=  req.body.from_price;
      catcheKey +=  req.body.to_price;
      filter.push({$expr: {
        $reduce: {
          input: "$variants",
          initialValue: false,
          in: {
            $and: [
              
              {$gte: [{$toInt: "$$this.selling_price"}, req.body.from_price]},
              {$lte: [{$toInt: "$$this.selling_price"}, req.body.to_price]}
            ]
          }
        }
      }});
    }
  const filterData =[
    {
      $lookup: {
        from: 'categories',
        as: 'category',
        let: { int_glcode: '$fk_category' },
        pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
      },
    },
    {$set:{
        category:{
            $arrayElemAt: ["$category",0]
        }
     }},
     
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
          : {chr_publish:true},
    },
  
    
    {$set:{total_review_value: {
        $reduce: {
          input: "$reviews.rating", // Iterate on array
          initialValue: 0,
          in: { $trunc: [ { $add: [ "$$value", { $toDouble: "$$this" } ] }, 2 ] } // convert string to double, sum-up & truncate to 2 digits
        }
      }
    }},
   
    {$set: {total_review: {$size: '$reviews'}}},
    {$set:{total_review_value:  { $cond: [ { $eq: ["$total_review", 0] }, 1,{ $trunc: [ { $divide: [ "$total_review_value", "$total_review"  ] }, 2 ]}]}  // convert string to double, sum-up & truncate to 2 digits
     }},
     {$set:{
        default_variant:{
            $arrayElemAt: ["$variants",0]
        }
     }},
    { $addFields:req.body.tuser?  { liked: { $cond: [ { $in: [req.body.tuser.user_id , "$wishList" ] }, true, false ] }
    }:{liked:false}},
     {$set:{
      variants:[]
     }},
     {$set:{
      brand:[]
     }},
     {$set:{
      reviews:[]
     }},
     {$set:{
      txt_nutrition:[]
     }},
     {
      $set:{
        txt_description:''
      }
     }


  ];
  
  const cache = NodeLocalCache.getCache();
  if(cache.get(catcheKey ) ==undefined){
    try {
      Product.aggregate([...filterData, { $sort: sort },
        { $limit: limit + page },
        { $skip: page }])

        .then(async (products: any) => {
         
          Product.aggregate([ {
            $match:
              filter.length > 0
                ? {
                    $and: filter,
                  }
                : {},
          },
        ]).then((count: any) => {
          cache.set(catcheKey,{ data: products, total: count.length })
            res.status(200).send({ data: products, total: count.length });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Product not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }}else{
      res.status(200).send(cache.get(catcheKey ));
    }
  }
  async getProductById(req: Request, res: Response) {
    try {
      let catcheKey ="_fproductById"
      if(req.params.slug){
        catcheKey+=req.params.slug;
      }
      const cache = NodeLocalCache.getCache();
      if(cache.get( catcheKey  ) ==undefined){
        Product.aggregate([{$match: { var_slug: req.params.slug }},
          {
            $lookup: {
              from: 'categories',
              as: 'category',
              let: { int_glcode: '$fk_category' },
              pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
            },
          },
        ])
        .then(async (products: any) => {
 
          const product = products[0];
          Product.findOneAndUpdate(
            { int_glcode: req.body.fk_product },
            { $inc: { view_count: 1 } },
            {
              new: true,
              upsert: true,
            },
          );
          if (req.body.tuser) {
            const crts = await Cart.findOne({
              $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: product.int_glcode }],
            });
            product.cartItem = crts ? crts.var_unit : 0;
          }
          product.defaultVariant=product.variants[0];
          product.var_price = product.variants[0].price;
          product.selling_price = product.variants[0].selling_price;
          product.variant_id = product.variants[0].int_glCode;
          product.share_url = `https://rdemo.ecommercesourcecode.com/website-fashionista/${product.var_slug}`;
          product.is_variant = 'Y';
          product.start_date = '0000-00-00';
          product.end_date = '0000-00-00';
          if (req.body.tuser && product.wishList) {
            product.like = product.wishList.find((data: any) => data === req.body.tuser.user_id) !== undefined ? 'Y' : 'N';
          } else {
            product.like = 'N';
          }
          product.totalRatting = product.reviews.length;
          product.ratting = 0;
          product.reviews.forEach((data:any)=>{
            product.ratting+=parseFloat(data.rating)
          })
          product.ratting = product.ratting/product.totalRatting;
          let attris: any[] = [];
          product.imgs = product.variants[0].image;
          product.variants.forEach((data:any)=>{
            attris = [...attris, ...data.attributes.map((atr:any)=>atr)];
          });
          const values = attris.map((data:any)=>{
           data.value.attribute_name = data.var_title;
           return data.value;
          });
          const attributesp =values.reduce(function(rv, x) {
            (rv[x['int_glcode']] = rv[x['int_glcode']] || []).push(x);
            return rv;
          }, {});
          
          const vAttribute: any[] = [];
          Object.values(attributesp).forEach((data:any)=>{
            vAttribute.push(data[0]);
            return '';
           });
          
           const attributes =Object.values(vAttribute).reduce(function(rv, x) {
            (rv[x['attribute_name']] = rv[x['attribute_name']] || []).push(x);
            return rv;
          }, {});
          const fAttribute: { var_attribute: any; attrs_v: any; }[] = [];
          Object.keys(attributes).sort((a,b)=>{
            if(a<b)return -1;
            else return 1;
           }).forEach((data:any)=>{
            fAttribute.push({
              'var_attribute':data,
               'attrs_v':attributes[data]
            });
           });
           product.prod_options = fAttribute;
         
          delete product.fk_tags;
          delete product.variants;
          delete product.wishList;
          if (product.txt_nutrition) {
            /* empty */
          } else {
            product.txt_nutrition = '';
          }
         
          cache.set(catcheKey,{  message:'', data: product })
          res.status(200).send({  message:'', data: product });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({  message: 'Product not found' });
        });
      }else{
        res.status(200).send(cache.get( catcheKey  ));
      }
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }

  async getProductVariant(req: Request, res: Response) {
    try {
        Product.aggregate([{$match: { int_glcode: req.body.fk_product }}])
        .then(async (products: any) => {
         
          const product = products[0];
          Product.findOneAndUpdate(
            { int_glcode: req.body.fk_product },
            { $inc: { view_count: 1 } },
            {
              new: true,
              upsert: true,
            },
          );
          let count =0;
          if(req.body.tuser){
            count = await Cart.countDocuments({
              $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: product.int_glcode }],
            });
          }
          product.is_variant = 'Y';
          product.var_price = product.variants[0].price;
          product.selling_price = product.variants[0].selling_price;
          product.start_date = '0000-00-00';
          product.end_date = '0000-00-00';
          if (req.body.tuser && product.wishList) {
            product.like = product.wishList.find((data: any) => data === req.body.tuser.user_id) !== undefined ? 'Y' : 'N';
          } else {
            product.like = 'N';
          }
          product.totalRatting = 0;
          product.ratting = 0;
          let imgs: any[] = [];
     
          let varients: any[] = [];
          let vProductOptions:any []=[]; 
          Object.keys( req.body.attributes).forEach((key: any,kindex: any)=>{
             
              if(kindex===0){
                const attData:{var_attribute:string, attrs_v:any[]}={
                  var_attribute:key,
                  attrs_v:[]
                }
                product.variants.forEach((data:any,index:Number)=>{
                  
                    data.attributes.map((atr:any)=>{
                      if(atr.value.int_glcode === req.body.attributes.Colour ){

                         imgs=data.image;
                      }
                      if(atr.var_title === key ){
                       
                        vProductOptions.push(atr);
                        
                      }
                    })
                  
                });
               // vProductOptions.push(attData);
              }else{
               
                const attData:{var_attribute:string, attrs_v:any[]}={
                  var_attribute:key,
                  attrs_v:[]
                }
                product.variants.forEach((data:any,index:Number)=>{
                  
                  let isExist: boolean = true;
                  for(let i=0;i<kindex;i++){
                    if(req.body.attributes[Object.keys( req.body.attributes)[i]] ===""){
                      let attriExist = true;
                      isExist = isExist&&attriExist;
                    }else{
                      let attriExist = false;
                      data.attributes.map((atr:any)=>{
                        
                        if(req.body.attributes[Object.keys( req.body.attributes)[i]] === atr.value.int_glcode){
                          attriExist = true;
                        }
                      })
                      isExist = isExist&&attriExist;
                    }
                  }
                  if(isExist){
                    data.attributes.map((atr:any)=>{
                      
                      if(atr.var_title === key ){
                        
                        vProductOptions.push(atr);
                        
                      }
                    })
                  }
                })
              
              }
                
          })
          product.variants.forEach((data:any,index:Number)=>{
            let isExist: boolean = true;
           
            data.attributes.map((atr:any)=>{
                 
                  if(req.body.attributes[atr.var_title]===''){
                    isExist = isExist&&true;
                    
                  }else{
                    //console.log("data",req.body.attributes[atr.var_title], atr.value.int_glcode)
                    if(req.body.attributes[atr.var_title] === atr.value.int_glcode){
                      isExist = isExist&&true;
                      
                    }else{
                      isExist = false;
                    }
                  }
              
            });
            if(isExist){
              
            
              varients = [ ...varients, data ];
            }
            isExist = true;
            
          });
          
         
          if(imgs.length===0){
            product.variants.forEach((data:any,index:Number)=>{
              data.attributes.map((atr:any)=>{
                        
                if(req.body.attributes[Object.keys( req.body.attributes)[0]] === atr.value.int_glcode){
                    imgs.push(...data.image)
                }});
            })
          }
          if(imgs.length===0){
            product.variants.forEach((data:any,index:Number)=>{
                imgs.push(...data.image)
            })
          }
          if(imgs.length>5){
            imgs = imgs.slice(0,4)
          }
          
          const values = vProductOptions.map((data:any)=>{
           data.value.attribute_name = data.var_title;
           return data.value;
          });
          const attributesp =values.reduce(function(rv, x) {
            (rv[x['int_glcode']] = rv[x['int_glcode']] || []).push(x);
            return rv;
          }, {});
          
          const vAttribute: any[] = [];
          Object.values(attributesp).forEach((data:any)=>{
            vAttribute.push(data[0]);
            return '';
           });
         
           const attributes =Object.values(vAttribute).reduce(function(rv, x) {
            (rv[x['attribute_name']] = rv[x['attribute_name']] || []).push(x);
            return rv;
          }, {});
          const fAttribute: { var_attribute: any; attrs_v: any; }[] = [];
          Object.keys(attributes).forEach((data:any)=>{
            fAttribute.push({
              'var_attribute':data,
               'attrs_v':attributes[data]
            });
           });
           fAttribute.sort((a,b)=>{
            if(a.var_attribute<b.var_attribute)return -1;
            else return 1;
           });
           
           product.prod_options = fAttribute;
         
           let pricing = {
            variant_id:  product.variants[0].int_glCode,
            price:product.variants[0].price,
            selling_price:product.variants[0].selling_price,
            stock: product.variants[0].stock
        };

          delete product.fk_tags;
          delete product.variants;
          delete product.wishList;
          if (product.txt_nutrition) {
            /* empty */
          } else {
            product.txt_nutrition = '';
          }
          product.cartItem = count;
        

          if(varients.length === 1){
            pricing = {
              variant_id: varients? varients[0].int_glCode:"",
              price:varients[0].price,
              selling_price:varients[0].selling_price,
              stock: varients[0].stock
          };
        }
        console.log({...pricing,imgs: imgs, prod_options:fAttribute})
          res.status(200).send({ ...pricing,imgs: imgs, prod_options:fAttribute });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Product not found' });
        });
      
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAttributeTree(req: Request, res: Response) {
    try {
      
      let catcheKey = "_fattribute_tree";
      
        catcheKey +=req.params.category;
         const cache = NodeLocalCache.getCache();
      if(cache.get( catcheKey ) ==undefined){
      const categories = await SubCategory.aggregate([
         {
          $match:{
            $and:[ 
              { fk_parent: req.params.category },
              {
                is_active: true               
              }
        ]},
        }]);
       
      const products = await Product.aggregate( [
        {
          $match:(req.params.category=="all")?  {
            chr_publish: true               
          }:{
            $and:[ 
              { fk_category: req.params.category },
              {
                chr_publish: true               
              }
        ]},
        }]);
      let attris: any[] = [];
      let tags:any = new Set([]);
      let brandIds:any = new Set([]);
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        tags = new Set([...tags, ...product.fk_tags]);
        brandIds = new Set([...brandIds, product.fk_brand]);
        product.variants.forEach((data:any)=>{
            attris = [...attris, ...data.attributes.map((atr:any)=>atr)];
        });
      }
      const brandFilter:any = [];
      Array.from(brandIds).forEach((data)=>{
          brandFilter.push({ int_glcode: data })
      })
      const brands = await Brand.aggregate([
        {
          $match:brandFilter.length>0?{
            $and:[ 
              {$or:brandFilter},
              {
                is_active: true               
              }
        ]}:{},
        }]);
       

      const values = attris.map((data:any)=>{
        data.value.attribute_name = data.var_title;
     
        return data.value;
       });
       const attributesp =values.reduce(function(rv, x) {
         (rv[x['int_glcode']] = rv[x['int_glcode']] || []).push(x);
        
         return rv;
       }, {});
       
       const vAttribute: any[] = [];
       Object.values(attributesp).forEach((data:any)=>{
         vAttribute.push(data[0]);
         return '';
        });
       
        const attributes =Object.values(vAttribute).reduce(function(rv, x) {
         (rv[x['attribute_name']] = rv[x['attribute_name']] || []).push(x);
       
         return rv;
       }, {});
       const fAttribute: {id: string, title: any; list: any; }[] = [];
       Object.keys(attributes).forEach((data:any)=>{
       
         fAttribute.push({
           'title':data,
           
            "id": attributes[data][0].attribute_id,
            'list':[...attributes[data].map((atr:any)=>{
           
              return {id: atr.int_glcode,color: atr.colorCode?atr.colorCode:'', value: atr.var_title};})]
         });
        });
        fAttribute.sort((a,b)=>{
         if(a.title<b.title)return -1;
         else return 1;
        });
        cache.set(catcheKey,{
          message: 'Success',
          categories:categories,
          attribute: fAttribute,
          brands:brands,
          tags: Array.from(tags)
        })
      res.status(200).send({
        message: 'Success',
        categories:categories,
        attribute: fAttribute,
        brands:brands,
        tags: Array.from(tags)
      });
      }else{
        res.status(200).send(cache.get( catcheKey  ));
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({  message: 'Unexpected error' });
    }
  }

  async updateProductWishList(req: Request, res: Response) {
    try {
    
      const data = await Product.find({ $and: [{ wishList: { $in: [req.body.tuser.user_id] } }, { int_glcode: req.body.fk_product }] });
      if (data.length > 0) {
        await Product.findOneAndUpdate(
          { int_glcode: req.body.fk_product },
          {
            $pull: { wishList: req.body.tuser.user_id },
          },
        );
        NodeLocalCache.getInstance();
        const cache = NodeLocalCache.getCache()
        cache.flushAll();
        cache.getStats();
        res.status(200).send({  message: 'Product removed from favourite.' });
      } else {
        await Product.findOneAndUpdate(
          { int_glcode: req.body.fk_product },
          {
            $push: { wishList: req.body.tuser.user_id },
          },
        );
        NodeLocalCache.getInstance();
        const cache = NodeLocalCache.getCache()
        cache.flushAll();
        cache.getStats();
        res.status(200).send({  message: 'Product added in favourite.' });
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
 
  async getWishList(req: Request, res: Response) {
    try {
      const data = await Product.aggregate([{ $match: { wishList: { $in: [req.body.tuser.user_id] } } },{$set:{
        Variant_details:{
            $arrayElemAt: ["$variants",0]
        }
     }}, {$set:{total_review_value: {
        $reduce: {
          input: "$reviews.rating", // Iterate on array
          initialValue: 0,
          in: { $trunc: [ { $add: [ "$$value", { $toDouble: "$$this" } ] }, 2 ] } // convert string to double, sum-up & truncate to 2 digits
        }
      }
    }},
   
    {$set: {total_review: {$size: '$reviews'}}},
    {$set:{total_review_value:  { $cond: [ { $eq: ["$total_review", 0] }, 1,{ $trunc: [ { $divide: [ "$total_review_value", "$total_review"  ] }, 2 ]}]}  // convert string to double, sum-up & truncate to 2 digits
     }}]);
      for (let i = 0; i < data.length; i++) {
        const product = data[i];
        let count = 0;
        if (req.body.tuser) {
          count = await Cart.countDocuments({
            $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: product.int_glcode }],
          });
        }
        product.var_price = product.variants[0].price;
        product.selling_price = product.variants[0].selling_price;
        product.start_date = '0000-00-00';
        product.end_date = '0000-00-00';
        if (req.body.tuser && product.wishList) {
          product.like = product.wishList.find((data: any) => data === req.body.tuser.user_id) !== undefined ? 'Y' : 'N';
        } else {
          product.like = 'N';
        }
        product.totalRatting = 0;
        product.ratting = 0;
        product.var_stock = product.variants[0].stock;
        product.variant_id = product.variants[0].int_glCode;
        product.is_variant = 'Y';
        product.Variant_details = {
          int_glcode: product.variants[0].int_glCode,
          fk_product: product.int_glcode,
          variant_id: product.variants[0].int_glcode,
          var_stock: product.variants[0].stock,
          var_price: product.variants[0].price,
          selling_price: product.variants[0].selling_price,
          start_date: '0000-00-00',
          end_date: '0000-00-00',
        };
        product.fk_tags = undefined;
        product.variants = undefined;
        product.wishList = undefined;

        delete product.fk_tags;
        delete product.variants;
        delete product.wishList;
        if (product.txt_nutrition) {
          /* empty */
        } else {
          product.txt_nutrition = '';
        }
     
        if (req.body.tuser) {
          const crts = await Cart.findOne({
            $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: product.int_glcode }],
          });
          product.cartItem = crts ? crts.var_unit : 0;
        }
      }
      res.status(200).send({ status: 1, message: 'Success', data: data });
    } catch (e) {
      logger.error('', e);
      res.status(404).send({ status: 0, message: 'Unexpected error' });
    }
  }
  async searchSuggetion(req: Request, res: Response) {
    try {
     
      const products = await Product.aggregate([
          { $match:{$and:[ {
           
              chr_publish: true               
            
          },{ var_title:{ $regex: req.params.var_keywords, $options: 'i' } } ]}},
          {
            $project: {
              var_title: '$var_title',
            }}
      ]);
      
      const pCategory = await Category.aggregate([
        { $match:{$and:[ {
          is_active: true,
        },{ var_title: { $regex: req.params.var_keywords, $options: 'i' } } ]}},
        {
          $project: {
            var_title: '$var_title',
          }}
      ]);
    
      res.status(200).send({  message: 'Success', data: [...products.map((data)=>data.var_title), ...pCategory.map((data)=>data.var_title)] });
    } catch (e) {
      logger.error('', e);
      res.status(404).send({ status: 0, message: 'Data not found' });
    }
  }
  async searchAll(req: Request, res: Response) {
    try {
      
      let homeCategories = await Category.aggregate([
        {
          $match:  { $and:[ {var_title: { $regex: req.body.search, $options: 'i' }} , {
            is_active: true,
          }]} 
        },
        {
          $project: {
            int_glcode: '$int_glcode',
            var_title: '$var_title',
            var_slug: '$var_slug',
            var_icon: '$var_icon',
          },
        },
        {
          $addFields: {
            fk_parent: '0',
          },
        },
      ]);
      if(homeCategories&&homeCategories.length>0){
        homeCategories = homeCategories[0];
      }
      if(!homeCategories||homeCategories.length === 0){
        const searchedOneProduct:any = await Product.aggregate([
          {
            $match: {
              chr_publish: true               
            },
          },
          {
            $match: { var_title: { $regex: req.body.search, $options: 'i' } },
          },
        ]);
        if(searchedOneProduct && searchedOneProduct.length>0){

          homeCategories = await Category.aggregate([
            {
              $match:  { $and:[ {int_glcode:  searchedOneProduct[0].fk_category} , {
                is_active: true,
              }]} 
            },
            {
              $project: {
                int_glcode: '$int_glcode',
                var_title: '$var_title',
                var_slug: '$var_slug',
                var_icon: '$var_icon',
              },
            },
            {
              $addFields: {
                fk_parent: '0',
              },
            },
          ]);
        }else{
          
          let subCategory = await SubCategory.aggregate([
            {
              $match: { $and:[ {var_title: { $regex: req.body.search, $options: 'i' }} , {
                is_active: true,
              }]}
            },
          
           
          ]);
          if(subCategory && subCategory.length>0){

            homeCategories = await Category.aggregate([
              {
                $match:  { $and:[ {int_glcode:  subCategory[0].fk_parent} , {
                  is_active: true,
                }]} 
              },
              {
                $project: {
                  int_glcode: '$int_glcode',
                  var_title: '$var_title',
                  var_slug: '$var_slug',
                  var_icon: '$var_icon',
                },
              },
              {
                $addFields: {
                  fk_parent: '0',
                },
              },
            ]);
          }
        }
      }
     

      const searchedProduct = await Product.aggregate([
        {
          $match: {
            chr_publish: true               
          },
        },
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
      
            from: 'sub_categories',
            as: 'subcategory',
            let: { int_glcode: '$fk_subcategory' },
            pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
          },
        },
        { $addFields:req.body.tuser?  { liked: { $cond: [ { $in: [req.body.tuser.user_id , "$wishList" ] }, true, false ] }
      }:{liked:false}},
        {
          $match: {$or:[{ var_title: { $regex: req.body.search, $options: 'i' } },
              { 'subcategory.var_title': { $regex: req.body.search, $options: 'i' } }
          ]},
        },
      ]);
      for (let i = 0; i < searchedProduct.length; i++) {
        const product = searchedProduct[i];
        if (req.body.tuser) {
          const crts = await Cart.findOne({
            $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: product.int_glcode }],
          });
          product.cartItem = crts ? crts.var_unit : 0;
        }
        product.var_price = product.variants[0].price;
        product.selling_price = product.variants[0].selling_price;
        product.start_date = '0000-00-00';
        product.end_date = '0000-00-00';
       
        product.totalRatting = 0;
        product.ratting = 0;
       
        product.var_stock = product.variants[0].stock;
        product.variant_id = product.variants[0].int_glCode;
        product.is_variant = 'Y';
        product.default_variant = {
          int_glCode: product.variants[0].int_glCode,
          fk_product: product.int_glcode,
          variant_id: product.variants[0].int_glcode,
          var_stock: product.variants[0].stock,
          var_price: product.variants[0].price,
          selling_price: product.variants[0].selling_price,
          start_date: '0000-00-00',
          end_date: '0000-00-00',
        };
        delete product.fk_tags;
        delete product.variants;
        delete product.wishList;
        if (product.txt_nutrition) {
          /* empty */
        } else {
          product.txt_nutrition = '';
        }
      }
     
      res.status(200).send({
        status: 1,
        message: 'Success',
        category: homeCategories,
        products: searchedProduct,
      });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ status: 0, message: 'Unexpected error' });
    }
  }
  async getCurrency(req: Request, res: Response){
    const currency =await  General.find();
     res.status(200).send({ data: currency[0].currency });
   }
   
}