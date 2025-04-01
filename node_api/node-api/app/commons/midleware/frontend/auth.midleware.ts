import express from 'express';
import { verifyJwt } from '../../../utils/jwt_utils';
import User from '../../../users/models/user.model';
import UserRole from '../../../users/models/role.model';

export class AuthMiddleWare {
  private static instance: AuthMiddleWare;

  /* getInstance function used to initiate the UsersMiddleWare.*/
  static getInstance() {
    if (!AuthMiddleWare.instance) {
      AuthMiddleWare.instance = new AuthMiddleWare();
    }
    return AuthMiddleWare.getInstance;
  }

  /* validateLoginFields function used to sanitization the login request fields*/
  async validateAuthorization(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.headers['authorization']) {
      try {
        /* This line used to check  the Authorization token is exist or not on API request header. */
        const authorization = req.headers['authorization'].split(' ');

        if (authorization[0] !== 'Bearer') {
          return res.status(401).send({ message: 'Missing authorization token' });
        } else {
          const decoded: { valid: boolean; expired: boolean; decode: any } = verifyJwt(authorization[1] as string);

          if (!decoded.valid) {
            return res.status(401).send({ message: 'Token invalid' });
          } else if (decoded.expired) {
            return res.status(401).send({ message: 'Token has expired' });
          } else {
            const user: any = await User.findOne({ user_id: decoded.decode.uid });

            if (user && user.is_active) {
              if (user.role_id && user.role_id !== '') {
                const role: any = await UserRole.findOne({ _id: user.role_id });
                req.body.trole = role;
              }
              req.body.tuser = user;
              next();
            } else {
              return res.status(401).send({ message: 'Token invalid' });
            }
          }
        }
      } catch (e) {
        return res.status(401).send({ message: 'Token invalid' });
      }
    } else {
      return res.status(401).send({ message: 'Missing authorization header' });
    }
  }


}
