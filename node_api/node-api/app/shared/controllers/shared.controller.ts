import express from 'express';
import path from 'path';
import fs from 'fs';
import Currency from '../models/currency.model';
import { ObjectId } from 'mongodb';
import moment from 'moment';
import { dateFormate } from '../../commons/constants';
import Image from '../models/image.model';
import { logger } from '../../commons/logger.middleware';
export class SharedController {
  constructor() {}
  async getImage(req: express.Request, res: express.Response) {
    try {
      res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Disposition', `attachment; filename=${req.params['url']}`);
             //res.status(200).sendFile( path.join( 'C:/Users/user_name/mern_reacthub/mern_reacthub/esc-node-api/upload/images/') + req.params['url']);//window setup
      //res.status(200).sendFile(path.join(__dirname.replace('dist/shared/controllers', ''), '/upload/images/') + req.params['url']); // linux setup try it if not work
      res.status(200).sendFile(path.join(__dirname.replace('dist/app/shared/controllers', ''), '/upload/images/') + req.params['url']); //linux
    } catch (error) {
      res.status(404).send({ error: 'Image not found' });
    }
  }

  async currenyIcon(req: express.Request, res: express.Response) {
    try {
      Currency.find()
        .then((currency: any) => {
          res.status(200).send({ status: 1, message: 'Success', currency: currency[0].currency });
        })
        .catch(() => {
          res.status(200).send({ message: 'Currency not found' });
        });
    } catch (error) {
      res.status(200).send({ error: 'Image not found' });
    }
  }

  async postImage(req: express.Request, res: express.Response) {
    res.status(200).send({ image: (req.file as { filename: string }).filename });
  }

  async getAllImages(req: express.Request, res: express.Response) {
    let limit = 10;
    let page = 0;

    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
    }
  
    try {
      Image.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ image_type: { $regex: req.body.search, $options: 'i' } },
              { image_title: { $regex: req.body.search, $options: 'i' } }
              ],
            }
          : {},
      )
        .skip(page)
        .sort({_id:-1})
        .limit(limit)
        .then((images: any) => {
          Image.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_promocode: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            //images = images.reverse()
            res.status(200).send({ status:1,data: images, total: count });
          });
        })
        .catch((e) => {
          console.log(e)
          logger.error('', e);
          res.status(404).send({ message: 'Image not found' });
        });
    } catch (e) {
      logger.error('', e);
      console.log(e)
      res.status(404).send({ message: 'Unexpected error' });
    }
  }
  async postImageByType(req: express.Request, res: express.Response) {
    const cId = new ObjectId();
   
    const cDate = moment().format(dateFormate);

    const  image = new Image({
      _id: cId,
      int_glcode: cId.toString(),
      dt_createddate: cDate,
      image_url: (req.file as { filename: string; }).filename,
      image_type: req.params.type,
      image_title:''
    })
    try{
     await image.save();
    }catch(e){
      logger.error('', e);
    }
  
 
    try{
    const imageDetail = await Image.find({image_url:(req.file as { filename: string; }).filename});
 
    res.status(200).send({ image: (req.file as { filename: string }).filename ,id:imageDetail[0].int_glcode});
    }catch(e){
    
      res.status(500).send({"message":""});
    }
  }


async postMultiImagesByType(req: express.Request, res: express.Response) {
    
    
    try{
      if(req.files!= undefined){
        const size:any =req.files.length;
        for(var i = 0; i<size; i++){
          const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
            const  image = new Image({
              _id: cId,
              int_glcode: cId.toString(),
              dt_createddate: cDate,
              image_url: ((req.files as [])[i] as {filename:string}).filename,
              image_type: req.params.type,
              image_title:req.params.name
            })
            
              image.save();
          
          }
      }
    }catch(e){

    }
    res.status(200).send({message:"Image(s) uploaded"});
  }

  async updateImageName(req: express.Request, res: express.Response) {
   
    
    const  image = {
      ...req.body
    }
   
    try{
      for(var i = 0; i<req.body.ids.length; i++){
        const imageResp = await Image.updateOne(
          { int_glcode: req.body.ids[i] 
          
          },
          { $set: image },
          {
            new: true,
            overwrite: false,
          },
        );
      }
      res.status(200).send({ message: 'Image Detail updated' });
    }catch(e){
     
      logger.error('', e);
      res.status(200).send({ message: 'Image could not updated' });
    }
  
  }


  
  
  async deletImage(req: express.Request, res: express.Response) {
    //fs.unlinkSync(path.join(__dirname.replace('dist/shared/controllers', ''), '/upload/images/') + req.params['url']);//linux setup, try it if not work 
    //fs.unlinkSync(path.join( 'C:/Users/dell/mern_reacthub/mern_reacthub/esc-node-api/upload/images/') + req.params['url']);
    fs.unlinkSync(path.join(__dirname.replace('dist/app/shared/controllers', ''), '/upload/images/') + req.params['url']); //linux
    res.status(200).send({ message: 'image deleted' });
  }
}
