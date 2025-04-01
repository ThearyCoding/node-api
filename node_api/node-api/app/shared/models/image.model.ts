import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface ImageInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  image_url: string;
  image_type:string;
  image_title: string;
  dt_createddate: string;
}
const imageSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: false },
  image_url: { type: String, required: true },
  image_type: { type: String, required: true },
  image_title:{type:String, required:false},
  dt_createddate: { type: String, required: true },
});
const Image = mongoose.model<ImageInterface>('images', imageSchema, 'images');

export default Image;
