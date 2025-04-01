import { Request, Response } from 'express';
import Category from '../../models/category.model';
import { logger } from '../../../../commons/logger.middleware';
import { NodeLocalCache } from '../../../../commons/node.cache';

export class CategoryController {
  constructor() {}
async getCetegory(req: Request, res: Response) {  
    try {
      let catcheKey = "_fcategories";
      if(req.params.limit){
       catcheKey += req.params.limit;
      }
      catcheKey +=req.params.category;
       const cache = NodeLocalCache.getCache();
    if(cache.get( catcheKey ) ==undefined){
      Category.aggregate(
      req.params.withsubcat==='y'? [
        { $match: {
          is_active: true,
        },},
        { $match: {
          is_active: true,
        },},
        {
            $lookup:{
                from:'sub_categories',
                as:'sub_categories',
                let: { fk_parent: '$int_glcode' },
                pipeline: [{ $match:{$and:[ { $expr: { $eq: ['$fk_parent', '$$fk_parent'] } },{
                  is_active: true,
                }] }}],
            }
        },
        {$limit:parseInt(req.params.limit)},
        {$skip:0},
        {
            $sort:{date:-1}
        }
       ]:[
        { $match: {
          is_active: true,
        },},
        { $match: {
          is_active: true,
        },},
        {$limit:parseInt(req.params.limit)},
        {$skip:0},
        {
            $sort:{date:-1}
        }
       ]
      )
        .then((categories: any) => {
          const categoriesd = categories.reverse()
          cache.set(catcheKey,{ data: categoriesd})
            res.status(200).send({ data: categoriesd});
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Categories not found' });
        });
      }else{
        res.status(200).send(cache.get( catcheKey  ));
      }
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getCategoryById(req: Request, res: Response) {
    let catcheKey = "_fcategorbyId";
    if(req.params.id){
      catcheKey +=req.params.id;
    }
   
     const cache = NodeLocalCache.getCache();
  if(cache.get( catcheKey ) ==undefined){
    try {
      Category.findOne({ _id: req.params.id })
        .then((category: any) => {
          cache.set(catcheKey,{ ...category._doc })
          res.status(200).send({ data: { ...category._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Category not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
    }else{
      res.status(200).send(cache.get( catcheKey  ));
    }
  }
}