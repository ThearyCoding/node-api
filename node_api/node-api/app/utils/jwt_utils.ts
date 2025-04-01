import jwt from 'jsonwebtoken';
import { jwtKey } from './Constants';

export const signInJwt = (object: Object, options?: jwt.SignOptions | undefined) => jwt.sign(object, jwtKey, { ...options });

export const verifyJwt = (token: string) => {
  try {
    const decode = jwt.verify(token, jwtKey);
    return { valid: true, expired: false, decode: decode };
  } catch (e: any) {
    return { valid: false, expired: e.message.includes('jwt expired'), decode: null };
  }
};
