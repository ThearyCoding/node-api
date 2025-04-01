import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface UserRoleInterface extends mongoose.Document {
  _id: ObjectId;
  role: string;
  type: string;
  desc: string;
  label: string;
  int_glcode: string;
  is_active: boolean;
  subroles: Array<Object>;
}
const userSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  role: { type: String, required: true },
  type: { type: String, required: true },
  int_glcode: { type: String, required: true },
  desc: { type: String },
  is_active: { type: Boolean, required: false, default: false },
  lable: { type: String, required: true },
  subroles: { type: Array<Object>, required: false, default: [] },
});

const UserRole = mongoose.model<UserRoleInterface>('Role', userSchema, 'roles');

export default UserRole;
