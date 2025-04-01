import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface CurrenyInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  currency: string;
}
const currencySchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: false },
  currency: { type: String, required: true },
});
const Currency = mongoose.model<CurrenyInterface>('Currency', currencySchema, 'currency');

export default Currency;
