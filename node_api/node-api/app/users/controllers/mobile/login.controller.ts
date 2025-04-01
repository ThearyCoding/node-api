import { Request, Response } from 'express';
import User from '../../models/user.model';
import bcrypt from 'bcrypt';
import { signInJwt } from '../../../utils/jwt_utils';
import { accessTokenExpTime } from '../../../utils/Constants';
import { logger } from '../../../commons/logger.middleware';

export class LoginController {
  constructor() {}
  async login(req: Request, res: Response) {
    try {
      const user: any = await User.findOne({ var_email: req.body.var_email });
      if (user && user.is_active) {
        const isValid = await bcrypt.compare(req.body.var_password, user.var_password);
        if (isValid) {
          const accessToken = signInJwt(
            {
              uid: user.user_id,
              email: user.var_email,
            },
            { expiresIn: accessTokenExpTime },
          );

          user.var_password = undefined;
           await User.updateOne({ var_email: req.body.var_email }, 
            {var_device_token:req.body.var_device_token}, {
            new: true,
            upsert: true,
          });
          return res.status(200).send({ status: 1, data: { ...user._doc, accessToken: accessToken } });
        } else {
          return res.status(200).send({ status: 0, message: 'Invalid user id or password' });
        }
      } else {
        return res.status(200).send({ status: 0, message: 'Invalid user id or password' });
      }
    } catch (e) {
      logger.error('', e);
      res.status(200).send({ status: 0, message: 'Invalid user id or password' });
    }
  }
}
