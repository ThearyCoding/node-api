import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface PolicyInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  tern_and_condition: string;
  shiping_policy: string;
  privacy_policy: string;
  return_policy: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const policySchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  tern_and_condition: { type: String, required: true },
  shiping_policy: { type: String, required: true },
  privacy_policy: { type: String, required: false },
  return_policy: { type: String, required: false },
  created_date: { type: String, required: false },
  updated_date: { type: String, required: false },
});
const Policy = mongoose.model<PolicyInterface>('Policy', policySchema, 'policies');

export default Policy;
