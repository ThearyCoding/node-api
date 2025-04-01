import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface RejectionInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  var_title: string;
  created_date: string;
  updated_date: string;
  chr_publish: boolean;
  chr_delete: boolean;
}
const rejectionSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  var_title: { type: String, required: true },
  created_date: { type: String, required: true },
  updated_date: { type: String, required: true },
  chr_publish: { type: String, required: true, default: true },
  chr_delete: { type: String, required: true, default: false },
});
const RejectionReason = mongoose.model<RejectionInterface>('RejectionReason', rejectionSchema, 'rejection_reason');

export default RejectionReason;
