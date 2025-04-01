import express from 'express';
import UserRole from '../../../users/models/role.model';
import User from '../../../users/models/user.model';
import { verifyJwt } from '../../../utils/jwt_utils';

export class AdminMiddleWare {
  private static instance: AdminMiddleWare;

  static getInstance() {
    if (!AdminMiddleWare.instance) {
      AdminMiddleWare.instance = new AdminMiddleWare();
    }
    return AdminMiddleWare.getInstance;
  }

  async validateAdminUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.headers['authorization']) {
      try {
        const authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
          return res.status(200).send({ status: 0, message: 'Missing authorization token' });
        } else {
          const decoded: { valid: boolean; expired: boolean; decode: any } = verifyJwt(authorization[1] as string);
          if (!decoded.valid) {
            return res.status(200).send({ status: 0, message: 'Token invalid' });
          } else if (decoded.expired) {
            return res.status(200).send({ status: 0, message: 'Token has expired' });
          } else {
            const user: any = await User.findOne({ user_id: decoded.decode.uid });

            if (user && user.is_active) {
              const role: any = await UserRole.findOne({ _id: user.role_id });
              if (role) {
                if (role.type === 'admin') {
                  req.body.tuser = user;
                  next();
                } else {
                  return res.status(200).send({ status: 0, message: 'Access Denied' });
                }
              } else {
                return res.status(200).send({ status: 0, message: 'Access Denied' });
              }
            } else {
              return res.status(200).send({ status: 0, message: 'Token invalid' });
            }
          }
        }
      } catch (e) {
        return res.status(200).send({ status: 0, message: 'Token invalid' });
      }
    } else {
      return res.status(200).send({ status: 0, message: 'Missing authorization header' });
    }
  }
  async validateSuperAdminUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.headers['authorization']) {
      try {
        const authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
          return res.status(200).send({ status: 0, message: 'Missing authorization token' });
        } else {
          const decoded: { valid: boolean; expired: boolean; decode: any } = verifyJwt(authorization[1] as string);
          if (!decoded.valid) {
            return res.status(200).send({ status: 0, message: 'Token invalid' });
          } else if (decoded.expired) {
            return res.status(200).send({ status: 0, message: 'Token has expired' });
          } else {
            const user: any = await User.findOne({ user_id: decoded.decode.uid });
            if (user && user.is_active) {
              const role: any = await UserRole.findOne({ _id: user.role_id });
              if (role.type === 'admin' && role.role === 'super-admin') {
                req.body.tuser = user;
                next();
              } else {
                return res.status(200).send({ status: 0, message: 'Access Denied' });
              }
            } else {
              return res.status(200).send({ status: 0, message: 'Token invalid' });
            }
          }
        }
      } catch (e) {
        return res.status(200).send({ status: 0, message: 'Token invalid' });
      }
    } else {
      return res.status(200).send({ status: 0, message: 'Missing authorization header' });
    }
  }
}
