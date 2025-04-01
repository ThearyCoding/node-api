/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import CompanyDetails from '../../models/companydetail.model';
import { dateFormate } from '../../../../commons/constants';
const { ObjectId } = require('mongodb');

export class CompanyDetailsController {
  constructor() {}
  async createCompanyDetails(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const meta = new CompanyDetails({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      ...req.body,
    });
    try {
      meta
        .save()
        .then(() => {
          res.status(200).send({ message: 'Company details created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateCompanyDetailsById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const meta = new CompanyDetails({
      updated_date: cDate,
      ...req.body,
    });
    try {
      CompanyDetails.findOneAndUpdate({ int_glcode: req.params.id }, meta, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Company details updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteCompanyDetailsById(req: Request, res: Response) {
    try {
      CompanyDetails.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Company details deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Company details not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllCompanyDetails(req: Request, res: Response) {
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
      CompanyDetails.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((metacontent: any) => {
          CompanyDetails.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: metacontent, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Company details not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getCompanyDetailsById(req: Request, res: Response) {
    try {
      CompanyDetails.findOne({ _id: req.params.id })
        .then((metacontent: any) => {
          res.status(200).send({ data: { ...metacontent._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Company details not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
