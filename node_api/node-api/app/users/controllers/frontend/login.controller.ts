import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { signInJwt } from '../../../utils/jwt_utils';
import { CRYPT_SIZE, accessTokenExpTime } from '../../../utils/Constants';
import User from '../../models/user.model';
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
          return res.status(200).send({ data: { ...user._doc, accessToken: accessToken } });
        } else {
          return res.status(404).send({ message: 'Invalid user id or password' });
        }
      } else {
        if (!user.is_active) {
          return res.status(404).send({ message: 'Your account is deactivated, Contact your admin' });
        } else {
          return res.status(404).send({ message: 'Invalid user id or password' });
        }
      }
    } catch (e) {
      logger.error('', e);
      res.status(404).send({ message: 'Invalid user id or password' });
    }
  }
  async changePassword(req: Request, res: Response) {
    try {
      const user: any = req.body.tuser;
      console.log(user)
      if (user && user.is_active) {
        const isValid = await bcrypt.compare(req.body.old_password, user.var_password);
        if (isValid) {
          if (req.body.var_password && req.body.var_password.length > 2) {
            const salt = await bcrypt.genSalt(CRYPT_SIZE);
            const hash = await bcrypt.hash(req.body.var_password, salt);
            req.body.var_password = hash;
          }
          const user = {
            
            ...req.body,
          };
          
            User.findOneAndUpdate({ user_id: req.body.tuser.user_id }, {$set:user}, {
              new: true,
              upsert: true,
            }) .then(() => {
              return res.status(200).send( { message:"Password change Successfully"} );
            }).catch((e) => {
              logger.error('', e);
            return res.status(404).send({ message: 'Invalid old password' });
          })
        } else {
          return res.status(404).send({ message: 'Invalid old password' });
        }
      } else {
        
          return res.status(404).send({ message: 'Invalid user id or password' });
        
      }
    } catch (e) {
      logger.error('', e);
      res.status(404).send({ message: 'Invalid old password' });
    }
  }
}
