import express from 'express';
import { regEmail, regMobileNo } from '../../../utils/Constants';

export class UsersMiddleWare {
  private static instance: UsersMiddleWare;

  /* getInstance function used to initiate the UsersMiddleWare.*/
  static getInstance() {
    if (!UsersMiddleWare.instance) {
      UsersMiddleWare.instance = new UsersMiddleWare();
    }
    return UsersMiddleWare.getInstance;
  }

  /* validateLoginFields function used to sanitization the login request fields*/
  validateSignUpFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_email) {
      res.status(400).send({ message: 'Email is required field' });
    } else if (!regEmail.test(req.body.var_email)) {
      res.status(400).send({ message: 'Invalid email address' });
    } else if (!req.body.var_mobile_no) {
      res.status(400).send({ message: 'Mobile is required field' });
    } else if (!regMobileNo.test(req.body.var_mobile_no)) {
      res.status(400).send({ message: 'Invalid moble no.' });
    } else if (!req.body.var_name) {
      res.status(400).send({ message: 'Name is required field' });
    } else if (!req.body.var_password) {
      res.status(400).send({ message: 'Password is required field' });
    } else next();
  }
  validateSignInFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.var_email) {
      res.status(400).send({ message: 'Email is required field' });
    } else if (!req.body.var_password) {
      res.status(400).send({ message: 'Password is required field' });
    } else next();
  }
}
