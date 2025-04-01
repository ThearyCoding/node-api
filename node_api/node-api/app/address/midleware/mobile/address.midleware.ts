import express from 'express';

export class AddressMiddleWare {
  private static instance: AddressMiddleWare;

  static getInstance() {
    if (!AddressMiddleWare.instance) {
      AddressMiddleWare.instance = new AddressMiddleWare();
    }
    return AddressMiddleWare.getInstance;
  }
  validateAddressFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_house_no) {
      res.status(400).send({ message: 'House no is required field' });
    } else if (!req.body.var_apartment) {
      res.status(400).send({ message: 'Appartment is required field' });
    } else if (!req.body.var_landmark) {
      res.status(400).send({ message: 'Landmark is required field' });
    } else if (!req.body.var_country) {
      res.status(400).send({ message: 'Country is required field' });
    } else if (!req.body.var_state) {
      res.status(400).send({ message: 'State is required field' });
    } else if (!req.body.var_city) {
      res.status(400).send({ message: 'City is required field' });
    } else if (!req.body.var_pincode) {
      res.status(400).send({ message: 'Pin code is required field' });
    } else if (!req.body.var_type) {
      res.status(400).send({ message: 'Type  is required field' });
    } else next();
  }
  validateUpdateAddressFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.fk_address) {
      res.status(400).send({ message: 'Address id is required field' });
    } else next();
  }
}
