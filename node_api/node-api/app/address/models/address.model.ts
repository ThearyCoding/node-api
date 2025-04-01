import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface AddressInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  fk_user: string;
  var_house_no: string;
  var_app_name: string;
  var_landmark: string;
  var_country: string;
  var_state: string;
  var_city: string;
  var_pincode: string;
  chr_type: string;
  default_status: string;
  chr_publish: boolean;
  chr_delete: boolean;
  dt_createddate: string;
  dt_modifydate: string;
  var_country_code: string;
  var_ipaddress: string;
}
const addressSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  fk_user: { type: String, required: true },
  var_house_no: { type: String, required: true },
  var_app_name: { type: String, required: true },
  var_landmark: { type: String, required: true },
  var_country: { type: String, required: true },
  var_state: { type: String, required: true },
  var_city: { type: String, required: true },
  var_country_code:{ type: String, required: false, default:"IN" },
  var_pincode: { type: String, required: true },
  chr_type: { type: String, required: false },
  default_status: { type: String, required: false, default: 'N' },
  chr_publish: { type: Boolean, required: false },
  chr_delete: { type: Boolean, required: false, default: false },
  dt_createddate: { type: String, required: false },
  dt_modifydate: { type: String, required: false },
  var_ipaddress: { type: String, required: false, default: '' },
});
const Address = mongoose.model<AddressInterface>('Address', addressSchema, 'address');

export default Address;
