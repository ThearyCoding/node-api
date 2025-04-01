import express from 'express';
import User from '../../../users/models/user.model';
import { verifyJwt } from '../../../utils/jwt_utils';

export class AuthMiddleWare {
  private static instance: AuthMiddleWare;

  static getInstance() {
    if (!AuthMiddleWare.instance) {
      AuthMiddleWare.instance = new AuthMiddleWare();
    }
    return AuthMiddleWare.getInstance;
  }

  async validateAuthorization(req: express.Request, res: express.Response, next: express.NextFunction) {
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
              req.body.tuser = user;
              next();
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
