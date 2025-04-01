import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface AboutInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  content: string;
  banner: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const aboutSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  content: { type: String, required: true },
  banner: { type: String, required: true },
  created_date: { type: String, required: false },
  updated_date: { type: String, required: false },
});
const About = mongoose.model<AboutInterface>('About', aboutSchema, 'about');

export default About;
