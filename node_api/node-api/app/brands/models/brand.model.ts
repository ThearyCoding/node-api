import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface BrandInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  var_title: string;
  var_slug: string;
  var_icon: string;
  viewCount: number;
  soldCount: number;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const brandSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  var_title: { type: String, required: true },
  var_slug: { type: String, required: true },
  var_icon: { type: String, required: true },
  viewCount: { type: Number, required: true },
  soldCount: { type: Number, required: true },
  created_date: { type: String, required: true },
  updated_date: { type: String, required: true },
  is_active: { type: Boolean, required: true },
});
const Brand = mongoose.model<BrandInterface>('Brand', brandSchema, 'brands');

export default Brand;
