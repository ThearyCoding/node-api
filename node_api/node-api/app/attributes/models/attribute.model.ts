import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface AttributeInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  var_title: string;
  var_type: string;
  is_deletable: boolean;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const attributeSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  var_title: { type: String, required: true },
  created_date: { type: String, required: true },
  var_type: { type: String, required: false, default: '' },
  is_deletable: { type: Boolean, required: false, default: true },
  updated_date: { type: String, required: true },
  is_active: { type: Boolean, required: true },
});
const Attribute = mongoose.model<AttributeInterface>('Attribute', attributeSchema, 'attributes');

export default Attribute;
