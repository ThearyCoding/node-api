/* eslint-disable indent */
import { Request, Response } from 'express';
import Product from '../../models/product.model';
import Category from '../../../categories/parent/models/category.model';
import Banner from '../../../banners/models/banner.model';
import Cart from '../../../carts/models/cart.model';
import { logger } from '../../../commons/logger.middleware';

export class ProductController {
  constructor() {}

  async getHomeProduct(req: Request, res: Response) {
    try {
      const offerProduct = await Product.aggregate([
        {
          $match: {
            $and: [
              { chr_publish: true },
              {
                $expr: {
                  $and: [
                    { home_display: 'Y' },

                    {
                      $gt: [
                        {
                          $toInt: '$var_offer',
                        },
                        0,
                      ]
                    },
                  ],
                },
              },
            ],
          },
        },
        { $sort: { date: -1 } },
        { $limit: 5 },
        { $skip: 0 },
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
      const hotProduct = await Product.aggregate([
        {
          $match: {
            chr_publish: true,
          },
        },
        { $sort: { date: -1 } },
        { $limit: 5 },
        { $skip: 0 },
      ]);
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

      const homeCategories = await Category.aggregate([
        {
          $match: {
            $and: [{ is_home_active: true }],
          },
        },
        { $limit: 10 },
        { $sort: { date: -1 } },
        { $skip: 0 },
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

      const homeBanners = await Banner.aggregate([
        {
          $match: {
            $and: [{ chr_publish: 'Y' }],
          },
        },
        { $limit: 10 },
        { $sort: { date: -1 } },
        { $skip: 0 },
        {
          $project: {
            int_glcode: '$int_glcode',
            var_title: '$var_title',
            txt_description: '$txt_description',
            var_image: '$var_image',
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
        offerProducts: offerProduct,
        hotProducts: hotProduct,
        homeCategory: homeCategories,
        homeBanner: homeBanners,
      });
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
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
        res.status(200).send({ status: 1, message: 'Product removed from favourite.' });
      } else {
        await Product.findOneAndUpdate(
          { int_glcode: req.body.fk_product },
          {
            $push: { wishList: req.body.tuser.user_id },
          },
        );
        res.status(200).send({ status: 1, message: 'Product added in favourite.' });
      }
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
  async getWishList(req: Request, res: Response) {
    try {
      const data = await Product.aggregate([{ $match: { wishList: { $in: [req.body.tuser.user_id] } } }]);
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
      res.status(200).send({ status: 0, message: 'Unexpected error' });
    }
  }
}
