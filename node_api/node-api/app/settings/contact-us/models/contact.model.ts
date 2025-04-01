import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface ContactInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  email: string;
  phone: string;
  facebook: string;
  insta: string;
  google: string;
  twitter: string;
  youtube: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const contactSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  site_name: { type: String, required: false },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  facebook: { type: String, required: false },
  insta: { type: String, required: false },
  google: { type: String, required: false },
  twitter: { type: String, required: false },
  youtube: { type: String, required: false },
  created_date: { type: String, required: false },
  updated_date: { type: String, required: false },
});
const Contact = mongoose.model<ContactInterface>('Contact', contactSchema, 'contact');

export default Contact;
