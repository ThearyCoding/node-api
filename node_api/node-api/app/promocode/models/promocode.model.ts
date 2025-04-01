import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface PromoCodeInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  var_promocode: string;
  no_of_time: string;
  expiry_date: string;
  var_percentage: number;
  min_order: number;
  txt_description: string;
  max_discount_price: number;
  chr_publish: boolean;
  chr_delete: boolean;
  dt_createddate: string;
  dt_modifydate: string;
  var_ipaddress: string;
}

const promoCodeSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  var_promocode: { type: String, required: true, unique: true },
  no_of_time: { type: Number, required: true },
  expiry_date: { type: String, required: true },
  var_percentage: { type: Number, required: true },
  max_discount_price: { type: Number, required: true },
  min_order: { type: Number, required: true },
  txt_description: { type: String, required: true },
  chr_publish: { type: Boolean, required: false, default: true },
  chr_delete: { type: Boolean, required: false, default: false },
  dt_createddate: { type: String, required: false },
  dt_modifydate: { type: String, required: false },
  var_ipaddress: { type: String, required: false, default: '' },
});
const Promocode = mongoose.model<PromoCodeInterface>('PromoCode', promoCodeSchema, 'promo_codes');
export default Promocode;
