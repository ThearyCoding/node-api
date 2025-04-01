import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface OfferBannerInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  var_title: string;
  var_image: string;
  chr_publish: string;
  image_type: string;
  created_date: string;
  updated_date: string;
  chr_delete: boolean;
  date: Date;
}
const offerBannerSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  var_title: { type: String, required: true },
  chr_publish: { type: String, required: true, default: 'Y' },
  created_date: { type: String, required: true },
  updated_date: { type: String, required: true },
  image_type: { type: String, required: true, default:'h' },
  var_image: { type: String, required: true },
  chr_delete: { type: String, required: true, default: false },
  date: {
    type: Date,
    default: Date.now,
  },
});
const OfferBanner = mongoose.model<OfferBannerInterface>('OfferBanner', offerBannerSchema, 'offer_banners');

export default OfferBanner;
