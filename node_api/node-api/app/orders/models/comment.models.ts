import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface CommentInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  order_id: string;
  message: string;
  dt_createddate: string;
  status: string;
}
const commentSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  order_id: { type: String, required: true },
  message: { type: String, required: true },
  dt_createddate: { type: String, required: true },
  status: { type: String, required: true },
});
const OrderComment = mongoose.model<CommentInterface>('Comment', commentSchema, 'comments');

export default OrderComment;
