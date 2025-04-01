import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface GeneralInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  site_name: string;
  footer_copyright: string;
  currency: string;
  site_logo: string;
  fav_icon: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const generalSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  site_name: { type: String, required: true },
  footer_copyright: { type: String, required: true },
  currency: { type: String, required: false },
  site_logo: { type: String, required: false },
  fav_icon: { type: String, required: false },
  created_date: { type: String, required: false },
  updated_date: { type: String, required: false },
});
const General = mongoose.model<GeneralInterface>('General', generalSchema, 'general');

export default General;
