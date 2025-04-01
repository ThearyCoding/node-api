import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface DeliveryTimeInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  dt_start_time: string;
  dt_end_time: string;
  dt_slot_end_time: string;
  chr_type: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const deliverTimeSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  dt_start_time: { type: String, required: true },
  dt_end_time: { type: String, required: false },
  dt_slot_end_time: { type: String, required: false },
  chr_type: { type: String, required: false },
  created_date: { type: String, required: true },
  updated_date: { type: String, required: true },
  is_active: { type: String, required: true },
});
const DeliveryTime = mongoose.model<DeliveryTimeInterface>('DeliveryTime', deliverTimeSchema, 'delivery_time');

export default DeliveryTime;
