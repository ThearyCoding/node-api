import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface MetacontentInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  title: string;
  desc: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const metacontentSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  title: { type: String, required: false },
  desc: { type: String, required: false },
  created_date: { type: String, required: false },
  updated_date: { type: String, required: false },
});
const MetaConent = mongoose.model<MetacontentInterface>('MetaConent', metacontentSchema, 'meta-content');

export default MetaConent;
