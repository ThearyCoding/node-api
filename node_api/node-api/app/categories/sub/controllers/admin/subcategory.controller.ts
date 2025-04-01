/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import SubCategory from '../../models/subcategory.model';
import { dateFormate } from '../../../../commons/constants';
import { logger } from '../../../../commons/logger.middleware';
import { NodeLocalCache } from '../../../../commons/node.cache';
const { ObjectId } = require('mongodb');

export class SubCategoryController {
  constructor() {}
  async createCategory(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    req.body.is_home_active = req.body.is_home_active == 'true' ? true : false;
    const category = new SubCategory({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      viewCount: 0,
      var_slug: req.body.var_title.toString().replace(' ', '-'),
      soldCount: 0,
      ...req.body,
    });
    try {
      category
        .save()
        .then(() => {
          const cache = NodeLocalCache.getCache();
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Sub Category created' });
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
      SubCategory.findOneAndUpdate(
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
          res.status(200).send({ message: 'Sub Category updated' });
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
        await SubCategory.findOneAndDelete({ _id: ids[i] });
      }
      const cache = NodeLocalCache.getCache();
      cache.flushAll();
      cache.getStats();
      res.status(200).send({ message: 'Sub Category deleted' });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllCategory(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = 'sub_category';
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
          SubCategory.aggregate([
            {
              $lookup: {
                from: 'categories',
                as: 'category',
                let: { int_glcode: '$fk_parent' },
                pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
              },
            },
            {
              $match:
                req.body.search && req.body.search.length > 0
                  ? {
                      $or: [{ var_title: { $regex: req.body.search, $options: 'i' } },{"category.var_title":{ $regex: req.body.search, $options: 'i' }},{ int_glcode: { $regex: req.body.search, $options: 'i' } }],
                    }
                  : {},
            },
            { $sort: sort },
            { $limit: limit + page },
            { $skip: page },
          
          ])

            .then((categories: any) => {
              SubCategory.aggregate([
                {
                  $lookup: {
                    from: 'categories',
                    as: 'category',
                    let: { int_glcode: '$fk_parent' },
                    pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
                  },
                },
                {
                  $match:
                    req.body.search && req.body.search.length > 0
                      ? {
                          $or: [{ var_title: { $regex: req.body.search, $options: 'i' } },{"category.var_title":{ $regex: req.body.search, $options: 'i' }},{ int_glcode: { $regex: req.body.search, $options: 'i' } }],
                        }
                      : {},
                },
               
              
              ]).then((count: any) => {
                cache.set(catcheKey,{ data: categories, total: count.length })
                res.status(200).send({ data: categories, total: count.length });
              });
            })
            .catch((e) => {
              logger.error('', e);
              res.status(500).send({ message: 'Sub Categories not found' });
            });
       }else{
            res.status(200).send(cache.get(catcheKey ));
       }          
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }

  async getAllCategoryByParent(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    let catcheKey = '';
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
    catcheKey+=req.params.pid;
    catcheKey += limit+page
    try {
      const cache = NodeLocalCache.getCache();
      if(cache.get(catcheKey ) ==undefined){
        const subCat =   SubCategory.find({ fk_parent: req.params.pid });
        if(req.body.page){
          subCat.skip(page)
        }
        subCat .sort(sort)
        if(req.body.limit){
          subCat.limit(limit)
        }
        subCat  .then((categories: any) => {
              SubCategory.countDocuments(
                req.body.search && req.body.search.length > 0
                  ? {
                      $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                    }
                  : {},
              ).then((count: any) => {
                cache.set(catcheKey,{ data: categories, total: count })
                res.status(200).send({ data: categories, total: count });
              });
            })
            .catch((e) => {
              logger.error('', e);
              res.status(500).send({ message: 'Sub Categories not found' });
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
        SubCategory.findOne({ _id: req.params.id })
          .then((category: any) => {
            cache.set(req.params.id,{ data: { ...category._doc } })
            res.status(200).send({ data: { ...category._doc } });
          })
          .catch((e) => {
            logger.error('', e);
            res.status(500).send({ message: 'Sub Category not found' });
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
