import { Request, Response } from 'express';
import moment from 'moment';
import General from '../../models/about.model';
import About from '../../models/about.model';
import { dateFormate } from '../../../../commons/constants';
const { ObjectId } = require('mongodb');

export class AboutController {
  constructor() {}
  async createAbout(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const about = new About({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      ...req.body,
    });
    try {
      about
        .save()
        .then(() => {
          res.status(200).send({ message: 'About created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateAboutById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const about = new About({
      updated_date: cDate,
      ...req.body,
    });
    try {
      About.findOneAndUpdate({ int_glcode: req.params.id }, about, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'About updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteAboutById(req: Request, res: Response) {
    try {
      About.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'About deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'About not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllAbout(req: Request, res: Response) {
    let limit = 10;
    let page = 0;
    let sort = {};
    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
    }
    if (req.body.sort) {
      sort = req.body.sort;
    }
    try {
      About.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((about: any) => {
          General.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: about, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'About not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAboutById(req: Request, res: Response) {
    try {
      About.findOne({ _id: req.params.id })
        .then((about: any) => {
          res.status(200).send({ data: { ...about._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'About not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
