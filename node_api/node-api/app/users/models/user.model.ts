import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { CRYPT_SIZE } from '../../utils/Constants';

export interface UserInterface extends mongoose.Document {
  _id: ObjectId;
  user_id: string;
  var_email: string;
  var_mobile_no: string;
  var_name: string;
  last_name: string;
  var_alt_mobile: string;
  var_default_no: string;
  var_password: string;
  var_image: string;
  chr_gender: string;
  var_dob: string;
  chr_verify: string;
  var_device_token: string;
  refferal_code: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
  role_id: string;
  user_type: string;
}
const userSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  user_id: { type: String, required: true },
  var_email: { type: String, required: true, unique: true, index: true },
  var_mobile_no: { type: String, unique: true, index: true },
  var_name: { type: String, required: true },
  last_name: { type: String, required: false },
  var_alt_mobile: { type: String, required: false },
  var_default_no: { type: String, required: false },
  var_password: { type: String, required: true },
  var_image: { type: String, required: false },
  chr_verify: { type: String, required: false },
  chr_gender: { type: String, required: false, default: '' },
  var_dob: { type: String, required: false, default: '' },
  var_device_token: { type: String, required: false },
  refferal_code: { type: String, required: false },
  created_date: { type: String, required: false },
  updated_date: { type: String, required: true },
  is_active: { type: Boolean, required: true },
  role_id: { type: String, required: false, default: '' },
  user_type: { type: String },
});
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('var_password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(CRYPT_SIZE);
  const hash = await bcrypt.hash(user.var_password, salt);
  user.var_password = hash;
  return next();
});

const User = mongoose.model<UserInterface>('User', userSchema, 'users');

export default User;
