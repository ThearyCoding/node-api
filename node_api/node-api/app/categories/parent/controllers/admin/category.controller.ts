/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Category from '../../models/category.model';
import { dateFormate } from '../../../../commons/constants';
import { logger } from '../../../../commons/logger.middleware';
import { NodeLocalCache } from '../../../../commons/node.cache';
const { ObjectId } = require('mongodb');

export class CategoryController {
  constructor() {}
  async createCategory(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const category = new Category({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      viewCount: 0,
      var_slug: req.body.var_title.toString().replace(' ', '-'),
      soldCount: 0,
      ...req.body,
       //var_icon:   var_icon: 'https://bucket.fitwhey.com/products/638f9e3fd1e01.webp'
      //here you have to add 
    });
    try {
      category
        .save()
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Category created' });
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
  async updateCategoryById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    let category;
    if (req.file) {
      category = {
        updated_date: cDate,
        ...req.body,
      };
    } else {
      category = {
        updated_date: cDate,
        ...req.body,
      };
    }
    try {
      Category.findOneAndUpdate(
        { int_glcode: req.params.id },
        { $set: category },
        {
          new: false,
          overwrite: true,
        },
      )
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Category updated' });
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
    async deleteCategoryById(req: Request, res: Response) {
      try {
        const ids = req.params.ids.split(',');
        for (let i = 0; i < ids.length; i++) {
          await Category.findOneAndDelete({ _id: ids[i] });
        }
        const cache = NodeLocalCache.getCache();
        cache.flushAll();
        cache.getStats();
        res.status(200).send({ message: 'Category deleted' });
      } catch (e) {
        logger.error('', e);
        res.status(500).send({ message: 'Unexpected error' });
      }
    }
  async getAllCategory(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '_category';
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
     const categ =    Category.find(
          req.body.search && req.body.search.length > 0
            ? {
                $or: [{ var_title: { $regex: req.body.search, $options: 'i' } },{ int_glcode: { $regex: req.body.search, $options: 'i' } }],
              }
            : {},
        );
        if(req.body.page){
        categ .skip(page)
        }
        categ .sort(sort)
        if(req.body.limit){
        categ.limit(limit)
        }
        categ .then((categories: any) => {
            console.log("categories",categories)
            Category.countDocuments(
              req.body.search && req.body.search.length > 0
                ? {
                    $or: [{ var_title: { $regex: req.body.search, $options: 'i' } },{ int_glcode: { $regex: req.body.search, $options: 'i' } }],
                  }
                : {},
            ).then((count: any) => {
              cache.set(catcheKey,{ data: categories, total: count })
              res.status(200).send({ data: categories, total: count });
            });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(404).send({ message: 'Categories not found' });
          });
        }else{
          res.status(200).send(cache.get(catcheKey ));
        }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getCategoryById(req: Request, res: Response) {
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get( req.params.id  ) ==undefined){
        Category.findOne({ _id: req.params.id })
          .then((category: any) => {
            cache.set(req.params.id,{ data: { ...category._doc } })
            res.status(200).send({ data: { ...category._doc } });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(404).send({ message: 'Category not found' });
          });
      }else{
        res.status(200).send(cache.get( req.params.id  ));
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
