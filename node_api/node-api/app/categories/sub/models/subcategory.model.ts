import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface SubCategoryInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  fk_parent: string;
  var_title: string;
  var_slug: string;
  var_icon: string;
  soldCount: number;
  viewCount: number;
  created_date: string;
  updated_date: string;
  is_active: boolean;
  is_home_active: boolean;
  date: Date;
}
const subCategorySchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  fk_parent: { type: String, required: true },
  var_title: { type: String, required: true },
  var_slug: { type: String, required: true },
  var_icon: { type: String, required: true },
  viewCount: { type: Number, required: false },
  soldCount: { type: Number, required: false },
  created_date: { type: String, required: true },
  updated_date: { type: String, required: true },
  is_home_active: { type: Boolean, required: false },
  is_active: { type: Boolean, required: true },
  date: {
    type: Date,
    default: Date.now,
  },
});
const SubCategory = mongoose.model<SubCategoryInterface>('SubCategory', subCategorySchema, 'sub_categories');

export default SubCategory;
