import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { CRYPT_SIZE } from '../../utils/Constants';

export interface DeliveryBoyInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  fk_vendor: string;
  var_name: string;
  var_email: string;
  var_mobile_no: string;
  var_password: string;
  var_address: string;
  var_latitude: string;
  var_longitude: string;
  chr_status: string;
  current_status: string;
  var_profile: string;
  nation_id: string;
  var_aadharcard: string;
  vehicle_image: string;
  var_pancard: string;
  var_device_token: string;
  chr_publish: string;
  chr_delete: string;
  dt_createddate: string;
  dt_modifydate: string;
  var_ipaddress: string;
  date: Date;
}
const deliveryBoySchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  fk_vendor: { type: String, required: false },
  var_name: { type: String, required: true },
  var_email: { type: String, required: true },
  var_mobile_no: { type: String, required: true },
  var_password: { type: String, required: true },
  var_address: { type: String, required: false },
  var_latitude: { type: String, required: false },
  var_longitude: { type: String, required: false },
  chr_status: { type: String, required: true, default: 'Y' },
  current_status: { type: String, required: true, default: 'Y' },
  var_profile: { type: String, required: false },
  nation_id: { type: String, required: false },
  var_aadharcard: { type: String, required: false },
  vehicle_image: { type: String, required: false },
  var_pancard: { type: String, required: false },
  var_device_token: { type: String, required: false },
  chr_publish: { type: String, required: false },
  chr_delete: { type: String, required: false },
  dt_createddate: { type: String, required: false },
  dt_modifydate: { type: String, required: false },
  var_ipaddress: { type: String, required: false },
  date: {
    type: Date,
    default: Date.now,
  },
});
deliveryBoySchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('var_password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(CRYPT_SIZE);
  const hash = await bcrypt.hash(user.var_password, salt);
  user.var_password = hash;
  return next();
});

const DeliveryBoy = mongoose.model<DeliveryBoyInterface>('DeliveryBoy', deliveryBoySchema, 'delivery_boys');

export default DeliveryBoy;
