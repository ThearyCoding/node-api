/* eslint-disable prettier/prettier */
/* eslint-disable indent */
import { Request, Response } from 'express';
import Product from '../../models/product.model';
import Category from '../../../categories/parent/models/category.model';
import Cart from '../../../carts/models/cart.model';

export class ProductListController {
  constructor() {}

  async getOfferProductList(req: Request, res: Response) {
    try {
      const page = (req.body.page - 1) * 10;
      const limit = 10;
      const offerProduct = await Product.aggregate([
        {
          $match: {
            $and:[
              { chr_publish: true },
            {$expr: {
              $and: [
                { home_display: 'Y' },
                
                {
                  $gt: [
                    {
                      $toInt: '$var_offer',
                    },
                    0,
                  ],
                },
              ],
            },}
            ]
          },
        },
        { $sort: { date: -1 } },
        { $limit: limit + page },
        { $skip: page },
      ]);
      for (let i = 0; i < offerProduct.length; i++) {
        const product = offerProduct[i];
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
        data: offerProduct,
      });
    } catch (e) {
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
  async getHotProductList(req: Request, res: Response) {
    try {
      const page = (req.body.page - 1) * 10;
      const limit = 10;
      const hotProduct = await Product.aggregate([
        {
          $match: {
            chr_publish: true               
          },
        }
        ,{ $sort: { date: -1 } }, { $limit: limit + page }, { $skip: page }]);
      for (let i = 0; i < hotProduct.length; i++) {
        const product = hotProduct[i];
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
        data: hotProduct,
      });
    } catch (e) {
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
  async searchAll(req: Request, res: Response) {
    try {
      const searchedProduct = await Product.aggregate([
        {
          $match: {
            chr_publish: true               
          },
        },
        {
          $match: { var_title: { $regex: req.body.search, $options: 'i' } },
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
        delete product.fk_tags;
        delete product.variants;
        delete product.wishList;
        if (product.txt_nutrition) {
          /* empty */
        } else {
          product.txt_nutrition = '';
        }
      }
      const homeCategories = await Category.aggregate([
        {
          $match: req.body.search.length > 0 ? { $and:[ {var_title: { $regex: req.body.search, $options: 'i' }} , {
            is_active: true,
          }]} : {
            is_active: true,
          },
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
      res.status(200).send({
        status: 1,
        message: 'Success',
        category: homeCategories,
        products: searchedProduct,
      });
    } catch (e) {
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }

  async productList(req: Request, res: Response) {
    try {
      const page = (req.body.page - 1) * 10;
      const limit = 10;
      let sort_by:{} = { date: -1 };
      const filter: any[] = [];
      if (req.body.fk_category) {
        filter.push({ fk_category: req.body.fk_category });
      }
      if (req.body.var_keywords) {
        filter.push({ var_title: { $regex: req.body.var_keywords, $options: 'i' } });
      }
      if (req.body.fk_subcategory) {
        filter.push({ fk_subcategory: req.body.fk_subcategory });
      }
      if (req.body.brands && req.body.brands.length>0) {
        const brandFilter: any = [];
        req.body.brands.forEach((data: string)=>{
          brandFilter.push({ fk_brand: data });
        });
        const brandFilterOr: any = {$or: brandFilter};
        filter.push(brandFilterOr);
      }
      if (req.body.attrs && req.body.attrs.length>0) {
        const attributesFilter: any = [];
        
        req.body.attrs.forEach((data: string)=>{
          attributesFilter.push(
          {
              "variants.attributes.value.int_glcode": {
                "$regex": data,
                "$options": "i"
              }
          });
        });
        const attributesFilterOr: any = {$or: attributesFilter};
        filter.push(attributesFilterOr);
      }
      if(req.body.sort_by === 'recent'){
        sort_by = { date: -1 };
      }else if(req.body.sort_by === 'popular'){
        sort_by = { sold_count: -1 };
      }
      if (req.body.minPrice && req.body.maxPrice) {
        
        filter.push({$expr: {
          $reduce: {
            input: "$variants",
            initialValue: false,
            in: {
              $and: [
                
                {$gte: [{$toInt: "$$this.selling_price"}, req.body.minPrice]},
                {$lte: [{$toInt: "$$this.selling_price"}, req.body.maxPrice]}
              ]
            }
          }
        }});
      }
      
      
      filter.push({chr_publish: true});
      const products = await Product.aggregate([
        {
          $match:
            filter.length > 0
              ? {
                $and: filter,
                }
              : {},
        },
        { $sort: sort_by },
        { $limit: limit + page },
        { $skip: page },
      ]);
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        let count =0;
        if(req.body.tuser){
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
        delete product.fk_tags;
        delete product.variants;
        delete product.wishList;
        if (product.txt_nutrition) {
          /* empty */
        } else {
          product.txt_nutrition = '';
        }
        product.cartItem = count;
      }
      
       if(req.body.sort_by === 'low'){
        products.sort((a:any, b:any)=>{
        if(parseFloat(a.Variant_details.var_price)< parseFloat(b.Variant_details.var_price)){
          return -1;
        }else{
          return 1;
        }});
      }
      else if(req.body.sort_by === 'high'){
        products.sort((a:any, b:any)=>{
        if(parseFloat(a.Variant_details.var_price)< parseFloat(b.Variant_details.var_price)){
          return 1;
        }else{
          return -1;
        }});
        
      }
      res.status(200).send({ status: 1, message: 'Success', data: products });
    } catch (e) {
      res.status(200).send({ status: 0, message: 'Product not found' });
    }
  }


  async searchSuggetion(req: Request, res: Response) {
    try {
     
      const products = await Product.aggregate([
          { $match:{$and:[ {
           
              chr_publish: true               
            
          },{ var_title:{ $regex: req.body.var_keywords, $options: 'i' } } ]}},
          {
            $project: {
              var_title: '$var_title',
            }}
      ]);
      
      const pCategory = await Category.aggregate([
        { $match:{$and:[ {
          is_active: true,
        },{ var_title: { $regex: req.body.var_keywords, $options: 'i' } } ]}},
        {
          $project: {
            var_title: '$var_title',
          }}
      ]);
    
      res.status(200).send({ status: 1, message: 'Success', data: [...products.map((data)=>data.var_title), ...pCategory.map((data)=>data.var_title)] });
    } catch (e) {
      res.status(200).send({ status: 0, message: 'Data not found' });
    }
  }
  async getProductById(req: Request, res: Response) {
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
          if (req.body.tuser) {
            const crts = await Cart.findOne({
              $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: product.int_glcode }],
            });
            product.cartItem = crts ? crts.var_unit : 0;
          }
          
          product.var_price = product.variants[0].price;
          product.selling_price = product.variants[0].selling_price;
          product.variant_id = product.variants[0].int_glCode;
          const sl = product.var_slug.replaceAll(" ","-");
          product.share_url = `http://your_url/${sl}`;
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
          res.status(200).send({ status: 1, message:'', data: product });
        })
        .catch(() => {

          res.status(200).send({ status: 0, message: 'Product not found' });
        });
    } catch (e) {
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
          const imgs: any[] = [];
     
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
          varients.forEach((data)=>{
            imgs.push(...data.image);
          });
          
          if(imgs.length===0){
            product.variants.forEach((data:any,index:Number)=>{
              data.attributes.map((atr:any)=>{
                        
                if(req.body.attributes[Object.keys( req.body.attributes)[0]] === atr.value.int_glcode){
                    imgs.push(...data.image)
                }});
            })
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
              variant_id: varients[0].int_glCode,
              price:varients[0].price,
              selling_price:varients[0].selling_price,
              stock: varients[0].stock
          };
        }

          res.status(200).send({ status: 1, message:'success', ...pricing,imgs: imgs, prod_options:fAttribute });
        })
        .catch((e) => {
          console.log(e)
          res.status(200).send({ status: 0, message: 'Product not found' });
        });
    } catch (e) {
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
  async getAttributeTree(req: Request, res: Response) {
    try {
      const products = await Product.aggregate([
        {
          $match:{
            $and:[ 
              { fk_category: req.body.fk_category },
              {
                chr_publish: true               
              }
        ]},
        }]);
      let attris: any[] = [];
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        product.variants.forEach((data:any)=>{
            attris = [...attris, ...data.attributes.map((atr:any)=>atr)];
        });
      }
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
            'list':[...attributes[data].map((atr:any)=>{return {id: atr.int_glcode, value: atr.var_title};})]
         });
        });
        fAttribute.sort((a,b)=>{
         if(a.title<b.title)return -1;
         else return 1;
        });
      res.status(200).send({
        status: 1,
        message: 'Success',
        data: fAttribute,
      });
    } catch (e) {
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
        res.status(200).send({ status: 1, message: 'Review added successfully.' });
      
    } catch (e) {
      
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
}


