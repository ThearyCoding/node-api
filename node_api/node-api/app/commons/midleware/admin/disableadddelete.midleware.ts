import express from 'express';
import { verifyJwt } from '../../../utils/jwt_utils';
import User from '../../../users/models/user.model';

export class DisableAddDeleteMiddleWare {
    private static instance: DisableAddDeleteMiddleWare;
  
    /* getInstance function used to initiate the UsersMiddleWare.*/
    static getInstance() {
      if (!DisableAddDeleteMiddleWare.instance) {
        DisableAddDeleteMiddleWare.instance = new DisableAddDeleteMiddleWare();
      }
      return DisableAddDeleteMiddleWare.getInstance;
    }
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
    
                if (user && user.var_email === 'demo@reacthub.com') {
                    return res.status(200).send({ message: 'Access denied.You cannot access this feature. Your demo user.' });
                  
                } else {
                    
                    next();
                  
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