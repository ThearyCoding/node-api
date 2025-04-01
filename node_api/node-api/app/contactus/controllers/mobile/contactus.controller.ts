import moment from "moment";
import { Request, Response } from 'express';
import { ObjectId } from "mongodb";
import { dateFormate } from "../../../commons/constants";
import ContactUs from "../../models/contactus.model";

export class ContactUsController {
    constructor() {}
    async createContactUs(req: Request, res: Response) {
        const cId = new ObjectId();
        const cDate = moment().format(dateFormate);
        const contactUs = new ContactUs({
            _id: cId,
            int_glcode: cId.toString(),
            created_date: cDate,
            ...req.body
        });
        contactUs.save().then(async () => {
            res.status(200).send({ status: 1, message: 'Contact us create' });
        }) .catch((e) => {
            res.status(200).send({ status: 0, message: 'Failed to create contact us' });
          });
    }
}