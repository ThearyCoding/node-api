import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface AttributeValueInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  attribute_id: string;
  var_title: string;
  colorCode: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const attributeValueSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  attribute_id: { type: String, required: true },
  int_glcode: { type: String, required: true },
  var_title: { type: String, required: true },
  colorCode: { type: String, required: false, default: '' },
  created_date: { type: String, required: true },
  updated_date: { type: String, required: true },
  is_active: { type: Boolean, required: true },
});
const AttributeValue = mongoose.model<AttributeValueInterface>('AttributeValue', attributeValueSchema, 'attributes_values');

export default AttributeValue;
