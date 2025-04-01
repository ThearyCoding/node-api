/* eslint-disable indent */
import { Request, Response } from 'express';
import Category from '../../models/category.model';
import SubCategory from '../../../sub/models/subcategory.model';
import Product from '../../../../products/models/product.model';
import Cart from '../../../../carts/models/cart.model';
import { logger } from '../../../../commons/logger.middleware';

export class CategoryController {
  constructor() {}
  async getAllCategory(req: Request, res: Response) {
    try {
      Category.aggregate([
        {
          $match: {
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
      ])
        .then((categories: any) => {
          console.log(categories)
          res.status(200).send({ status: 1, message: 'Success', homeCategory: categories });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(200).send({ status: 0, message: 'Category not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Category not found' });
    }
  }
  async categoryDetail(req: Request, res: Response) {
    try {
      const pCategory = await Category.aggregate([
        { $match: { int_glcode: req.body.fk_category } },
        {
          $project: {
            int_glcode: '$int_glcode',
            var_title: '$var_title',
            var_slug: '$var_slug',
            var_icon: '$var_icon',
            fk_parent: '$fk_parent',
          },
        },
      ]);

      const subCategories = await SubCategory.aggregate([
        {
          $match: { fk_parent: req.body.fk_category },
        },
        {
          $project: {
            int_glcode: '$int_glcode',
            var_title: '$var_title',
            var_slug: '$var_slug',
            var_icon: '$var_icon',
            fk_parent: '$fk_parent',
          },
        },
      ]);
      let page = 0;
      if (req.body.page) {
        page = (req.body.page - 1) * 10;
      } else {
        page = 0;
      }

      const limit = 10;
      let sort_by: {} = { date: -1 };
      const filter: any[] = [];
      if (req.body.fk_category) {
        filter.push({ fk_category: req.body.fk_category });
      }
      if (req.body.fk_subcategory) {
        filter.push({ fk_subcategory: req.body.fk_subcategory });
      }
      if (req.body.var_keywords) {
        filter.push({ var_title: { $regex: req.body.var_keywords, $options: 'i' } });
      }
      if (req.body.brands && req.body.brands.length > 0) {
        const brandFilter: any = [];
        req.body.brands.forEach((data: string) => {
          brandFilter.push({ fk_brand: data });
        });
        const brandFilterOr: any = { $or: brandFilter };
        filter.push(brandFilterOr);
      }
      if (req.body.attrs && req.body.attrs.length > 0) {
        const attributesFilter: any = [];
        try {
          req.body.attrs.forEach((data: string) => {
            attributesFilter.push({
              'variants.attributes.value.int_glcode': {
                $regex: data,
                $options: 'i',
              },
            });
          });
          const attributesFilterOr: any = { $or: attributesFilter };
          filter.push(attributesFilterOr);
        } catch (e) {
          /* empty */
          logger.error('', e);
        }
      }
      if (req.body.sort_by && req.body.sort_by === 'recent') {
        sort_by = { date: -1 };
      } else if (req.body.sort_by && req.body.sort_by === 'popular') {
        sort_by = { sold_count: -1 };
      }
      if (req.body.minPrice < 1) {
        req.body.minPrice = 1;
      }
      if (req.body.minPrice && req.body.maxPrice) {
        filter.push({
          $expr: {
            $reduce: {
              input: '$variants',
              initialValue: false,
              in: {
                $and: [
                  { $gte: [{ $toDouble: '$$this.selling_price' }, req.body.minPrice] },
                  { $lte: [{ $toDouble: '$$this.selling_price' }, req.body.maxPrice] },
                ],
              },
            },
          },
        });
      }
      filter.push({ chr_publish: true });
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
        product.var_stock = product.variants[0].stock;
        if (product.variants.length === 1 && product.variants[0].attributes.length === 0) {
          product.variant_id = product.variants[0].int_glCode;
          product.is_variant = 'Y';
        } else {
          product.is_variant = '';
          product.variant_id = 'N';
        }
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
        if (req.body.tuser) {
          try {
            const crts = await Cart.findOne({
              $and: [{ fk_user: req.body.tuser.user_id }, { fk_product: product.int_glcode }],
            });
            product.cartItem = crts ? crts.var_unit : 0;
          } catch (e) {
            product.cartItem = 0;
          }
        }
      }
      if (req.body.sort_by && req.body.sort_by === 'low') {
        products.sort((a: any, b: any) => {
          if (parseFloat(a.Variant_details.var_price) < parseFloat(b.Variant_details.var_price)) {
            return -1;
          } else {
            return 1;
          }
        });
      } else if (req.body.sort_by && req.body.sort_by === 'high') {
        products.sort((a: any, b: any) => {
          if (parseFloat(a.Variant_details.var_price) < parseFloat(b.Variant_details.var_price)) {
            return 1;
          } else {
            return -1;
          }
        });
      }
      res.status(200).send({ status: 1, message: 'Success', ...pCategory[0], subCategory: subCategories, productList: products });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Category not found' });
    }
  }
}
