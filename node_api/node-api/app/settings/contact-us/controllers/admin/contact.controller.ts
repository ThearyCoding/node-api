/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import General from '../../models/contact.model';
import Contact from '../../models/contact.model';
import { dateFormate } from '../../../../commons/constants';
const { ObjectId } = require('mongodb');

export class ContactController {
  constructor() {}
  async createContact(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const contact = new Contact({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      ...req.body,
    });
    try {
      contact
        .save()
        .then(() => {
          res.status(200).send({ message: 'Contact created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateContactById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const contact = new Contact({
      updated_date: cDate,
      ...req.body,
    });
    try {
      Contact.findOneAndUpdate({ int_glcode: req.params.id }, contact, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Contact updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteContactById(req: Request, res: Response) {
    try {
      Contact.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Contact deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Contact not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllContact(req: Request, res: Response) {
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
      Contact.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((general: any) => {
          Contact.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: general, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Contact not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getContactById(req: Request, res: Response) {
    try {
      General.findOne({ _id: req.params.id })
        .then((general: any) => {
          res.status(200).send({ data: { ...general._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Contact not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
