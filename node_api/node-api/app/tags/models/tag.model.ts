import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface TagInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  var_title: string;
  var_icon: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const tagSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  var_title: { type: String, required: true },
  var_icon: { type: String, required: true },
  created_date: { type: String, required: true },
  updated_date: { type: String, required: true },
  is_active: { type: Boolean, required: true },
});
const Tag = mongoose.model<TagInterface>('Tag', tagSchema, 'tags');

export default Tag;
