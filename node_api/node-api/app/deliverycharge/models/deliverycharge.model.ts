import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface DeliveryChargeInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  var_charges: string;
  var_above: string;
  var_below: string;
  var_within_time: string;
  chr_type: string;
  var_label: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const deliverChargeSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  var_charges: { type: String, required: true },
  var_above: { type: String, required: false },
  var_below: { type: String, required: false },
  var_within_time: { type: String, required: false },
  chr_type: { type: String, required: false },
  var_label: { type: String, required: false },
  created_date: { type: String, required: true },
  updated_date: { type: String, required: true },
  is_active: { type: String, required: true },
});
const DeliveryCharge = mongoose.model<DeliveryChargeInterface>('DeliveryCharge', deliverChargeSchema, 'delivery_charge');

export default DeliveryCharge;
